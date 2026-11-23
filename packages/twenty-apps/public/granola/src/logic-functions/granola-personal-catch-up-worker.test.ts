import { enqueueJobs, kv, listConnections } from 'twenty-sdk/logic-function';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OWN_CONNECTION } from 'src/__tests__/utils/granola-personal-connection-fixtures';
import { GRANOLA_PERSONAL_CATCH_UP_WORKER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { granolaPersonalCatchUpWorkerHandler } from 'src/logic-functions/granola-personal-catch-up-worker';
import { computeCallRecordingIdForGranolaNote } from 'src/logic-functions/utils/compute-call-recording-id-for-granola-note.util';
import { getGranolaApiKeyFingerprint } from 'src/logic-functions/utils/get-granola-api-key-fingerprint.util';

const { queryRecordings } = vi.hoisted(() => ({ queryRecordings: vi.fn() }));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = queryRecordings;
  },
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<typeof import('twenty-sdk/logic-function')>()),
  enqueueJobs: vi.fn(),
  listConnections: vi.fn(),
  kv: { get: vi.fn() },
}));

const FOLDER_ID = 'fol_customerCalls1';
const SELECTED_AT = '2026-11-17T11:00:00.000Z';
const apiKeyFingerprint = getGranolaApiKeyFingerprint(
  OWN_CONNECTION.accessToken ?? '',
);
const initialScan = {
  kind: 'scan',
  pageIndex: 0,
  scope: {
    connectionId: OWN_CONNECTION.id,
    userWorkspaceId: OWN_CONNECTION.userWorkspaceId,
  },
  apiKeyFingerprint,
  updatedAfter: '2026-11-17T00:00:00.000Z',
} as const;
const folderPayload = {
  ...initialScan,
  folderId: FOLDER_ID,
} as const;

const enqueuedPayloads = () =>
  vi
    .mocked(enqueueJobs)
    .mock.calls.flatMap(([request]) =>
      (request.jobs ?? []).map(({ payload }) => payload),
    );

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime('2026-11-19T04:30:00.000Z');
  vi.mocked(listConnections).mockResolvedValue([OWN_CONNECTION]);
  vi.mocked(kv.get).mockResolvedValue([
    { folderId: FOLDER_ID, selectedAt: SELECTED_AT },
  ]);
  queryRecordings.mockResolvedValue({ callRecordings: { edges: [] } });
  vi.mocked(enqueueJobs).mockResolvedValue({
    enqueued: true,
    logicFunctionUniversalIdentifier:
      GRANOLA_PERSONAL_CATCH_UP_WORKER_UNIVERSAL_IDENTIFIER,
    enqueuedJobsCount: 1,
    jobIds: [],
    jobs: [],
  });
});

afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('granolaPersonalCatchUpWorkerHandler', () => {
  it('skips a connection without any selected folders', async () => {
    vi.mocked(kv.get).mockResolvedValue([]);
    const fetchProvider = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchProvider);

    await granolaPersonalCatchUpWorkerHandler(initialScan);

    expect(fetchProvider).not.toHaveBeenCalled();
    expect(enqueueJobs).not.toHaveBeenCalled();
  });

  it('skips notes before opt-in and deleted recordings and continues pagination', async () => {
    const note = {
      id: 'not_AaBbCcDdEeFfGg',
      object: 'note',
      title: null,
      owner: { name: null, email: 'member@example.com' },
      created_at: '2026-11-18T11:00:00.000Z',
      updated_at: '2026-11-18T11:00:00.000Z',
    };
    const deletedNoteId = 'not_OoPpQqRrSsTtUu';
    queryRecordings.mockResolvedValue({
      callRecordings: {
        edges: [
          { node: { id: computeCallRecordingIdForGranolaNote(deletedNoteId) } },
        ],
      },
    });
    const fetchProvider = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        notes: [
          note,
          { ...note, id: deletedNoteId },
          {
            ...note,
            id: 'not_HhIiJjKkLlMmNn',
            created_at: '2026-11-17T00:00:00Z',
          },
        ],
        cursor: 'next-page',
        hasMore: true,
      }),
    );
    vi.stubGlobal('fetch', fetchProvider);

    await granolaPersonalCatchUpWorkerHandler(folderPayload);

    const requestUrl = new URL(String(fetchProvider.mock.calls[0]?.[0]));

    expect(requestUrl.searchParams.get('folder_id')).toBe(FOLDER_ID);
    expect(requestUrl.searchParams.get('updated_after')).toBe(
      initialScan.updatedAfter,
    );
    expect(enqueuedPayloads()).toEqual([
      expect.objectContaining({ kind: 'note', noteId: note.id }),
      { ...folderPayload, cursor: 'next-page', pageIndex: 1 },
    ]);
    expect(enqueueJobs).toHaveBeenLastCalledWith(
      expect.objectContaining({ delayMs: 4_000 }),
    );
  });

  it('never queries Granola for a deselected folder or rotated key', async () => {
    const fetchProvider = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchProvider);

    await granolaPersonalCatchUpWorkerHandler({
      ...folderPayload,
      folderId: 'fol_partnerCalls12',
    });
    await granolaPersonalCatchUpWorkerHandler({
      ...folderPayload,
      apiKeyFingerprint: 'previous',
    });

    expect(fetchProvider).not.toHaveBeenCalled();
    expect(enqueueJobs).not.toHaveBeenCalled();
  });

  it('continues to the next selected folder when Granola removes access', async () => {
    const nextFolderId = 'fol_partnerCalls12';
    vi.mocked(kv.get).mockResolvedValue([
      { folderId: FOLDER_ID, selectedAt: SELECTED_AT },
      { folderId: nextFolderId, selectedAt: SELECTED_AT },
    ]);
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response(null, { status: 404 })),
    );

    await granolaPersonalCatchUpWorkerHandler({
      ...folderPayload,
      cursor: 'current-cursor',
      pageIndex: 1,
    });

    expect(enqueuedPayloads()).toEqual([
      { ...initialScan, folderId: nextFolderId },
    ]);
  });
});
