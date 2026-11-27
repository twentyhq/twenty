import { type RoutePayload } from 'twenty-sdk/define';
import { kv } from 'twenty-sdk/logic-function';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  GRANOLA_PERSONAL_WEBHOOK_UNIVERSAL_IDENTIFIER,
  GRANOLA_WEBHOOK_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { granolaWebhookResolverHandler } from 'src/logic-functions/granola-webhook-resolver';
import { getGranolaRegistrationClaimKey } from 'src/logic-functions/utils/get-granola-registration-claim-key.util';

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<typeof import('twenty-sdk/logic-function')>()),
  kv: { get: vi.fn() },
}));

const CONNECTION_ID = '9c0b21cd-97f1-44b5-b710-9210bc8a772c';
const WORKSPACE_ID = '73bf29d6-51a1-49fe-80f2-ba4a7930d04a';
const PERSONAL_REGISTRATION_ID = `personal-${CONNECTION_ID}`;

const buildDelivery = (registrationId: string): RoutePayload<unknown> => ({
  headers: {},
  queryStringParameters: { registrationId },
  pathParameters: {},
  body: null,
  isBase64Encoded: false,
  requestContext: { http: { method: 'POST', path: '/granola' } },
  userWorkspaceId: null,
});

afterEach(() => vi.resetAllMocks());

describe('granolaWebhookResolverHandler', () => {
  it('keeps the existing workspace delivery target', async () => {
    vi.mocked(kv.get).mockResolvedValue(WORKSPACE_ID);
    const routePayload = buildDelivery('a765978c-09c9-4f1a-88e6-d889ff2d105b');

    await expect(granolaWebhookResolverHandler(routePayload)).resolves.toEqual({
      workspaceId: WORKSPACE_ID,
      targetLogicFunctionUniversalIdentifier:
        GRANOLA_WEBHOOK_UNIVERSAL_IDENTIFIER,
      payload: { routePayload, receivedAt: expect.any(Number) },
    });
  });

  it('routes a personal delivery to the workspace that claimed it', async () => {
    vi.mocked(kv.get).mockResolvedValue(WORKSPACE_ID);
    const routePayload = buildDelivery(PERSONAL_REGISTRATION_ID);

    await expect(granolaWebhookResolverHandler(routePayload)).resolves.toEqual({
      workspaceId: WORKSPACE_ID,
      targetLogicFunctionUniversalIdentifier:
        GRANOLA_PERSONAL_WEBHOOK_UNIVERSAL_IDENTIFIER,
      payload: {
        routePayload,
        connectionId: CONNECTION_ID,
        receivedAt: expect.any(Number),
      },
    });
    expect(kv.get).toHaveBeenCalledWith(
      getGranolaRegistrationClaimKey(PERSONAL_REGISTRATION_ID),
      { scope: 'SERVER' },
    );
  });

  it('rejects a personal connection that has no server claim', async () => {
    vi.mocked(kv.get).mockResolvedValue(null);

    await expect(
      granolaWebhookResolverHandler(buildDelivery(PERSONAL_REGISTRATION_ID)),
    ).resolves.toMatchObject({ status: 404 });
  });
});
