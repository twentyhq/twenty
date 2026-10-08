import { type EnqueueJobsInput } from 'twenty-sdk/logic-function';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  GRANOLA_PENDING_FOLDER_SELECTION_KEY,
  GRANOLA_WEBHOOK_REGISTRATION_KEY,
} from 'src/constants/granola.constant';
import { GRANOLA_WEBHOOK_DEFERRAL_LIMIT } from 'src/constants/granola-history.constant';
import { granolaBackfillNoteHandler } from 'src/logic-functions/granola-backfill-note';
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
  'src/logic-functions/utils/create-granola-client-or-throw.util',
  () => ({
    createGranolaClientOrThrow: () => ({}),
  }),
);

vi.mock(
  'src/logic-functions/utils/sync-granola-note-to-call-recording-or-throw.util',
  () => ({ syncGranolaNoteToCallRecordingOrThrow: mocks.syncNote }),
);

const API_KEY = 'grn_test_key';
const NOTE_ID = 'not_1d3tmYTlCICgjy';

const storeRegistration = (folderIds: string[]) =>
  mocks.store.set(GRANOLA_WEBHOOK_REGISTRATION_KEY, {
    registrationId: 'reg-1',
    webhookEndpointId: 'wh-1',
    signingSecret: 'secret',
    apiKeyFingerprint: getGranolaApiKeyFingerprint(API_KEY),
    scopes: ['personal'],
    folderIds,
    isInitialBackfillEnqueued: true,
  });

const deferredPayload = (deferralCount: number) => ({
  registrationId: 'reg-1',
  noteId: NOTE_ID,
  deferredWebhook: { eventId: 'evt-1', deferralCount },
});

describe('granolaBackfillNoteHandler for a deferred webhook note', () => {
  beforeEach(() => {
    mocks.store.clear();
    vi.clearAllMocks();
    process.env[GRANOLA_API_KEY_ENV_VAR_NAME] = API_KEY;
    mocks.enqueueJobs.mockResolvedValue({ enqueued: true });
    mocks.syncNote.mockResolvedValue({ skipped: false });
    storeRegistration(['fol_parent']);
  });

  it('waits longer while the folder selection is still pending', async () => {
    mocks.store.set(GRANOLA_PENDING_FOLDER_SELECTION_KEY, { folderIds: [] });

    const result = await granolaBackfillNoteHandler(deferredPayload(0));

    expect(result).toEqual({ success: true, deferred: true });
    expect(mocks.syncNote).not.toHaveBeenCalled();
    expect(mocks.enqueueJobs).toHaveBeenCalledTimes(1);
    expect(mocks.enqueueJobs).toHaveBeenCalledWith(
      expect.objectContaining({
        delayMs: 60_000,
        jobs: [expect.objectContaining({ payload: deferredPayload(1) })],
      }),
    );
  });

  it('stops waiting after the deferral limit', async () => {
    mocks.store.set(GRANOLA_PENDING_FOLDER_SELECTION_KEY, { folderIds: [] });

    const result = await granolaBackfillNoteHandler(
      deferredPayload(GRANOLA_WEBHOOK_DEFERRAL_LIMIT - 1),
    );

    expect(result).toEqual({ success: true, skipped: true });
    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
    expect(mocks.syncNote).not.toHaveBeenCalled();
  });

  it('syncs the note once the selection settled', async () => {
    const result = await granolaBackfillNoteHandler(deferredPayload(2));

    expect(result).toEqual({ success: true, importedNoteCount: 1 });
    expect(mocks.syncNote).toHaveBeenCalledTimes(1);
    expect(mocks.syncNote).toHaveBeenCalledWith(
      expect.objectContaining({ noteId: NOTE_ID }),
    );
  });

  it('skips the note when the registration changed meanwhile', async () => {
    const result = await granolaBackfillNoteHandler({
      ...deferredPayload(0),
      registrationId: 'reg-old',
    });

    expect(result).toEqual({ success: true, skipped: true });
    expect(mocks.syncNote).not.toHaveBeenCalled();
  });
});
