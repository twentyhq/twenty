import { type EnqueueJobsInput } from 'twenty-sdk/logic-function';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GRANOLA_WEBHOOK_REGISTRATION_KEY } from 'src/constants/granola.constant';
import { buildGranolaNote } from 'src/__tests__/utils/build-granola-note.util';
import { granolaBackfillWorkerHandler } from 'src/logic-functions/granola-backfill-worker';
import { GRANOLA_API_KEY_ENV_VAR_NAME } from 'src/logic-functions/constants/granola-api-key-env-var-name';
import { getGranolaApiKeyFingerprint } from 'src/logic-functions/utils/get-granola-api-key-fingerprint.util';

const mocks = vi.hoisted(() => ({
  store: new Map<string, unknown>(),
  enqueueJobs: vi.fn<(input: EnqueueJobsInput) => Promise<unknown>>(),
  listNotes: vi.fn(),
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
  CoreApiClient: class {
    query = async () => ({ callRecordings: { edges: [] } });
  },
}));

vi.mock(
  'src/logic-functions/utils/create-granola-client-or-throw.util',
  () => ({
    createGranolaClientOrThrow: () => ({ listNotes: mocks.listNotes }),
  }),
);

const API_KEY = 'grn_test_key';

const listNoteJobIds = async ({
  createdAfter,
  updatedAfter,
  folderId,
  runDay = '2026-09-06',
  updatedAt = '2026-09-05T11:00:00Z',
}: {
  createdAfter?: string;
  updatedAfter?: string;
  folderId?: string;
  runDay?: string;
  updatedAt?: string;
}): Promise<(string | undefined)[]> => {
  mocks.enqueueJobs.mockClear();
  mocks.listNotes.mockResolvedValue({
    notes: [
      buildGranolaNote({ id: 'not_aaaaaaaaaaaaaa', updated_at: updatedAt }),
      buildGranolaNote({ id: 'not_bbbbbbbbbbbbbb', updated_at: updatedAt }),
    ],
    hasMore: false,
    cursor: null,
  });

  await granolaBackfillWorkerHandler({
    registrationId: 'reg-1',
    createdAfter,
    updatedAfter,
    folderId,
    pageIndex: 0,
    runDay,
  });

  return mocks.enqueueJobs.mock.calls.map(([input]) => input.jobs?.[0]?.jobId);
};

describe('granolaBackfillWorkerHandler', () => {
  beforeEach(() => {
    mocks.store.clear();
    vi.clearAllMocks();
    process.env[GRANOLA_API_KEY_ENV_VAR_NAME] = API_KEY;
    mocks.enqueueJobs.mockResolvedValue({ enqueued: true });
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

  it('gives an unchanged note the same import job across same-day runs', async () => {
    const manualImport = await listNoteJobIds({
      createdAfter: '2026-08-07T10:00:00.123Z',
    });
    const catchUp = await listNoteJobIds({
      updatedAfter: '2026-09-04T04:00:00.456Z',
    });

    expect(manualImport).toHaveLength(2);
    expect(new Set(manualImport).size).toBe(2);
    expect(catchUp).toEqual(manualImport);
  });

  it('gives a note a new import job on a later day', async () => {
    const today = await listNoteJobIds({});
    const tomorrow = await listNoteJobIds({ runDay: '2026-09-07' });

    expect(tomorrow[0]).not.toBe(today[0]);
  });

  it('gives a note a separate import job per folder', async () => {
    const first = await listNoteJobIds({ folderId: 'fol_aaaaaaaaaaaaaa' });
    const second = await listNoteJobIds({ folderId: 'fol_bbbbbbbbbbbbbb' });

    expect(second[0]).not.toBe(first[0]);
  });

  it('gives an edited note a new import job', async () => {
    const before = await listNoteJobIds({});
    const after = await listNoteJobIds({ updatedAt: '2026-09-06T09:00:00Z' });

    expect(after[0]).not.toBe(before[0]);
    expect(after[1]).not.toBe(before[1]);
  });
});
