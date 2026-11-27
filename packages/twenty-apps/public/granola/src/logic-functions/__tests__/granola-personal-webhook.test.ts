import { type RoutePayload } from 'twenty-sdk/define';
import { kv } from 'twenty-sdk/logic-function';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { granolaPersonalWebhookHandler } from 'src/logic-functions/granola-personal-webhook';
import { syncGranolaPersonalNoteOrThrow } from 'src/logic-functions/utils/sync-granola-personal-note-or-throw.util';

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<typeof import('twenty-sdk/logic-function')>()),
  kv: { get: vi.fn() },
}));

vi.mock(
  'src/logic-functions/utils/sync-granola-personal-note-or-throw.util',
  () => ({
    syncGranolaPersonalNoteOrThrow: vi.fn(),
  }),
);

const RECEIVED_AT = 1788566400000;
const REGISTRATION = {
  userWorkspaceId: '89112069-0314-49ac-91e9-bddf995f8da1',
  webhookEndpointId: 'whe_test',
  signingSecret: 'whsec_MDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDE=',
  apiKeyFingerprint: 'a'.repeat(64),
};
const DELIVERY: RoutePayload<unknown> = {
  headers: {
    'webhook-id': 'evt_123',
    'webhook-timestamp': String(RECEIVED_AT / 1000),
    'webhook-signature': 'v1,aW52YWxpZA==',
  },
  queryStringParameters: {},
  pathParameters: {},
  body: null,
  rawBody:
    '{"event_id":"evt_123","event_type":"note.generated","note_id":"not_12345678901234"}',
  isBase64Encoded: false,
  requestContext: { http: { method: 'POST', path: '/granola' } },
  userWorkspaceId: null,
};

const PAYLOAD = {
  routePayload: DELIVERY,
  receivedAt: RECEIVED_AT,
  connectionId: 'ca1be1ad-8824-4b52-8b30-f1e48ec4be62',
};

afterEach(() => vi.resetAllMocks());

describe('granolaPersonalWebhookHandler', () => {
  it.each([
    null,
    { ...REGISTRATION, userWorkspaceId: undefined },
    { ...REGISTRATION, apiKeyFingerprint: undefined },
  ])('rejects an incomplete registration', async (registration) => {
    vi.mocked(kv.get).mockResolvedValue(registration);

    await expect(granolaPersonalWebhookHandler(PAYLOAD)).resolves.toEqual({
      success: false,
      error: 'Unknown Granola registration',
    });
    expect(syncGranolaPersonalNoteOrThrow).not.toHaveBeenCalled();
  });

  it('rejects an invalid signature for a valid registration', async () => {
    vi.mocked(kv.get).mockResolvedValue(REGISTRATION);

    await expect(granolaPersonalWebhookHandler(PAYLOAD)).resolves.toEqual({
      success: false,
      error: 'Invalid Granola webhook signature',
    });
    expect(syncGranolaPersonalNoteOrThrow).not.toHaveBeenCalled();
  });
});
