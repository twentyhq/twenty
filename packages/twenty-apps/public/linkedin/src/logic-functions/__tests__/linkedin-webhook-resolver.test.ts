import { createHmac } from 'node:crypto';

import { type RoutePayload } from 'twenty-sdk/define';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LINKEDIN_HANDLE_WEBHOOK_EVENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type UnipileWebhookEvent } from 'src/unipile/types/unipile-webhook-event.type';

const mocks = vi.hoisted(() => ({
  kvGet: vi.fn(),
}));

vi.mock('twenty-sdk/define', () => ({
  defineLogicFunction: (config: unknown) => config,
}));

vi.mock('twenty-sdk/logic-function', () => ({
  kv: { get: mocks.kvGet },
  Response: class Response {
    constructor(
      readonly body: unknown,
      readonly init?: { status?: number },
    ) {}
  },
}));

const { linkedinWebhookResolverHandler } =
  await import('src/logic-functions/linkedin-webhook-resolver');

const SECRET = 'webhook-secret';
const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

const buildRoutePayload = ({
  event,
  secret = SECRET,
}: {
  event: UnipileWebhookEvent;
  secret?: string;
}): RoutePayload<UnipileWebhookEvent> => {
  const rawBody = JSON.stringify(event);
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');

  return {
    headers: { 'unipile-signature': `t=${timestamp},v0=${signature}` },
    queryStringParameters: {},
    pathParameters: {},
    body: event,
    rawBody,
    isBase64Encoded: false,
    requestContext: { http: { method: 'POST', path: '/' } },
    userWorkspaceId: null,
  };
};

const LINKEDIN_EVENT: UnipileWebhookEvent = {
  id: 'evt_1',
  created_at: '2026-10-28T10:00:00.000Z',
  account_id: 'acc_1',
  account_provider: 'linkedin',
  type: 'message.new',
  payload: {},
};

describe('linkedinWebhookResolverHandler', () => {
  beforeEach(() => {
    process.env.UNIPILE_WEBHOOK_SECRET = SECRET;
    mocks.kvGet.mockReset();
  });

  it('routes a signed LinkedIn event to the workspace claiming its account', async () => {
    mocks.kvGet.mockResolvedValue(WORKSPACE_ID);

    await expect(
      linkedinWebhookResolverHandler(
        buildRoutePayload({ event: LINKEDIN_EVENT }),
      ),
    ).resolves.toEqual({
      workspaceId: WORKSPACE_ID,
      targetLogicFunctionUniversalIdentifier:
        LINKEDIN_HANDLE_WEBHOOK_EVENT_UNIVERSAL_IDENTIFIER,
      payload: LINKEDIN_EVENT,
    });
    expect(mocks.kvGet).toHaveBeenCalledExactlyOnceWith(
      'unipile-account:acc_1',
      {
        scope: 'SERVER',
      },
    );
  });

  it('rejects a delivery with an invalid signature', async () => {
    const result = await linkedinWebhookResolverHandler(
      buildRoutePayload({ event: LINKEDIN_EVENT, secret: 'other-secret' }),
    );

    expect(result).toMatchObject({ init: { status: 401 } });
    expect(mocks.kvGet).not.toHaveBeenCalled();
  });

  it('skips events of other providers', async () => {
    const result = await linkedinWebhookResolverHandler(
      buildRoutePayload({
        event: { ...LINKEDIN_EVENT, account_provider: 'whatsapp' },
      }),
    );

    expect(result).toMatchObject({ body: { skipped: 'Not a LinkedIn event' } });
    expect(mocks.kvGet).not.toHaveBeenCalled();
  });

  it('skips accounts no workspace claims', async () => {
    mocks.kvGet.mockResolvedValue(null);

    const result = await linkedinWebhookResolverHandler(
      buildRoutePayload({ event: LINKEDIN_EVENT }),
    );

    expect(result).toMatchObject({
      body: { skipped: 'No workspace claims this account' },
    });
  });
});
