import { type EnqueueJobsInput } from 'twenty-sdk/logic-function';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  GRANOLA_HISTORY_SCHEDULE_KEY,
  GRANOLA_PENDING_FOLDER_SELECTION_KEY,
  GRANOLA_WEBHOOK_REGISTRATION_KEY,
} from 'src/constants/granola.constant';
import {
  GRANOLA_UNAVAILABLE_RETRY_LIMIT,
  GRANOLA_WEBHOOK_DEFERRAL_LIMIT,
} from 'src/constants/granola-history.constant';
import { granolaBackfillNoteHandler } from 'src/logic-functions/granola-backfill-note';
import { GRANOLA_API_KEY_ENV_VAR_NAME } from 'src/logic-functions/constants/granola-api-key-env-var-name';
import { GranolaUnavailableError } from 'src/logic-functions/types/granola-unavailable-error';
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
      expect.objectContaining({
        noteId: NOTE_ID,
        shouldSkipUnchangedNote: true,
      }),
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

describe('granolaBackfillNoteHandler when Granola is rate limited', () => {
  const backfillPayload = {
    registrationId: 'reg-1',
    noteId: NOTE_ID,
    updatedAt: '2026-09-05T11:00:00Z',
    runHour: '2026-09-06T10',
  };

  beforeEach(() => {
    mocks.store.clear();
    vi.clearAllMocks();
    process.env[GRANOLA_API_KEY_ENV_VAR_NAME] = API_KEY;
    mocks.enqueueJobs.mockResolvedValue({ enqueued: true });
    mocks.syncNote.mockRejectedValue(
      new GranolaUnavailableError({
        status: 429,
        retryAfterMilliseconds: 120_000,
      }),
    );
    storeRegistration([]);
  });

  it('schedules the note again after Retry-After instead of failing the job', async () => {
    const result = await granolaBackfillNoteHandler(backfillPayload);

    expect(result).toEqual({ success: true, deferred: true });
    expect(mocks.enqueueJobs).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        delayMs: 120_000,
        jobs: [
          expect.objectContaining({
            payload: { ...backfillPayload, retryAttempt: 1 },
          }),
        ],
      }),
    );
  });

  it('gives every retry its own job so the queue does not drop it', async () => {
    await granolaBackfillNoteHandler(backfillPayload);
    await granolaBackfillNoteHandler({ ...backfillPayload, retryAttempt: 1 });

    const [firstRetryJobId, secondRetryJobId] =
      mocks.enqueueJobs.mock.calls.map(([input]) => input.jobs?.[0]?.jobId);

    expect(firstRetryJobId).toBeDefined();
    expect(secondRetryJobId).not.toBe(firstRetryJobId);
  });

  it('waits for the next free import slot when it is later than Retry-After', async () => {
    mocks.store.set(GRANOLA_HISTORY_SCHEDULE_KEY, {
      nextNoteAvailableAt: Date.now() + 600_000,
    });

    await granolaBackfillNoteHandler(backfillPayload);

    expect(mocks.enqueueJobs).toHaveBeenCalledTimes(1);
    expect(mocks.enqueueJobs.mock.calls[0][0].delayMs).toBeGreaterThanOrEqual(
      599_000,
    );
  });

  it('spaces retries that share a Retry-After instead of starting them together', async () => {
    await granolaBackfillNoteHandler(backfillPayload);
    await granolaBackfillNoteHandler({
      ...backfillPayload,
      noteId: 'not_other',
    });

    const [firstDelay, secondDelay] = mocks.enqueueJobs.mock.calls.map(
      ([input]) => input.delayMs ?? 0,
    );

    expect(secondDelay - firstDelay).toBeGreaterThanOrEqual(3_000);
  });

  it('hands the failure back to the queue once the retry limit is reached', async () => {
    await expect(
      granolaBackfillNoteHandler({
        ...backfillPayload,
        retryAttempt: GRANOLA_UNAVAILABLE_RETRY_LIMIT,
      }),
    ).rejects.toBeInstanceOf(GranolaUnavailableError);
    expect(mocks.enqueueJobs).not.toHaveBeenCalled();
  });
});
