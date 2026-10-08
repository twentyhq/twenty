import { type EnqueueJobsInput } from 'twenty-sdk/logic-function';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  GRANOLA_PENDING_FOLDER_SELECTION_KEY,
  GRANOLA_WEBHOOK_REGISTRATION_KEY,
} from 'src/constants/granola.constant';
import { granolaWebhookHandler } from 'src/logic-functions/granola-webhook';
import { GRANOLA_API_KEY_ENV_VAR_NAME } from 'src/logic-functions/constants/granola-api-key-env-var-name';
import { getGranolaApiKeyFingerprint } from 'src/logic-functions/utils/get-granola-api-key-fingerprint.util';

const mocks = vi.hoisted(() => ({
  store: new Map<string, unknown>(),
  enqueueJobs: vi.fn<(input: EnqueueJobsInput) => Promise<unknown>>(),
  syncNote: vi.fn(),
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  kv: {
    get: async (key: string) => mocks.store.get(key),
    set: async (key: string, value: unknown) => {
      mocks.store.set(key, value);
    },
    delete: async (key: string) => {
      mocks.store.delete(key);
    },
  },
  enqueueJobs: mocks.enqueueJobs,
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {},
}));

vi.mock(
  'src/logic-functions/utils/verify-standard-webhook-signature.util',
  () => ({ verifyStandardWebhookSignature: () => true }),
);

vi.mock(
  'src/logic-functions/utils/sync-granola-note-to-call-recording-or-throw.util',
  () => ({ syncGranolaNoteToCallRecordingOrThrow: mocks.syncNote }),
);

const API_KEY = 'grn_test_key';
const NOTE_ID = 'not_1d3tmYTlCICgjy';

const deliver = (eventId: string) =>
  granolaWebhookHandler({
    receivedAt: Date.now(),
    routePayload: {
      queryStringParameters: { registrationId: 'reg-1' },
      headers: {
        'webhook-id': eventId,
        'webhook-timestamp': '1',
        'webhook-signature': 'v1,signature',
      },
      rawBody: JSON.stringify({
        event_id: eventId,
        event_type: 'note.edited',
        note_id: NOTE_ID,
      }),
    },
  });

describe('granolaWebhookHandler', () => {
  beforeEach(() => {
    mocks.store.clear();
    vi.clearAllMocks();
    process.env[GRANOLA_API_KEY_ENV_VAR_NAME] = API_KEY;
    mocks.enqueueJobs.mockResolvedValue({ enqueued: true });
    mocks.syncNote.mockResolvedValue({ skipped: false });
    mocks.store.set(GRANOLA_WEBHOOK_REGISTRATION_KEY, {
      registrationId: 'reg-1',
      webhookEndpointId: 'wh-1',
      signingSecret: 'secret',
      apiKeyFingerprint: getGranolaApiKeyFingerprint(API_KEY),
      scopes: ['personal'],
      folderIds: [],
      isInitialBackfillEnqueued: true,
    });
  });

  it('syncs the note right away when no folder selection is pending', async () => {
    const result = await deliver('evt-1');

    expect(result).toEqual({ success: true, skipped: false });
    expect(mocks.syncNote).toHaveBeenCalledTimes(1);
    expect(mocks.syncNote).toHaveBeenCalledWith(
      expect.objectContaining({ noteId: NOTE_ID }),
    );
    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
  });

  it('accepts the delivery and schedules the note while a folder selection is pending', async () => {
    mocks.store.set(GRANOLA_PENDING_FOLDER_SELECTION_KEY, { folderIds: [] });

    const result = await deliver('evt-1');

    expect(result).toEqual({ success: true, deferred: true });
    expect(mocks.syncNote).not.toHaveBeenCalled();
    expect(mocks.enqueueJobs).toHaveBeenCalledTimes(1);
    expect(mocks.enqueueJobs).toHaveBeenCalledWith(
      expect.objectContaining({
        delayMs: 30_000,
        jobs: [
          expect.objectContaining({
            payload: {
              registrationId: 'reg-1',
              noteId: NOTE_ID,
              deferredWebhook: { eventId: 'evt-1', deferralCount: 0 },
            },
          }),
        ],
      }),
    );
  });

  it('schedules a redelivered event under the same job', async () => {
    mocks.store.set(GRANOLA_PENDING_FOLDER_SELECTION_KEY, { folderIds: [] });

    await deliver('evt-1');
    await deliver('evt-1');
    await deliver('evt-2');

    const jobIds = mocks.enqueueJobs.mock.calls.map(
      ([input]) => input.jobs?.[0]?.jobId,
    );

    expect(jobIds[0]).toBe(jobIds[1]);
    expect(jobIds[2]).not.toBe(jobIds[0]);
  });
});
