import {
  enqueueJobs,
  kv,
  listConnections,
  reportConnectionAuthFailure,
} from 'twenty-sdk/logic-function';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  OTHER_CONNECTION,
  OWN_CONNECTION,
} from 'src/__tests__/utils/granola-personal-connection-fixtures';
import { granolaPersonalFolderSelectionHandler } from 'src/logic-functions/granola-personal-folder-selection';
import { getGranolaPersonalFolderSelectionKey } from 'src/logic-functions/utils/get-granola-personal-folder-selection-key.util';

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<typeof import('twenty-sdk/logic-function')>()),
  enqueueJobs: vi.fn(),
  listConnections: vi.fn(),
  reportConnectionAuthFailure: vi.fn(),
  kv: { get: vi.fn(), set: vi.fn() },
}));

const CUSTOMER_FOLDER_ID = 'fol_customerCalls1';
const PARTNER_FOLDER_ID = 'fol_partnerCalls12';
const SAVED_AT = '2026-11-17T12:00:00.000Z';
const OPTED_IN_AT = '2026-11-18T12:00:00.000Z';

const context = { userWorkspaceId: OWN_CONNECTION.userWorkspaceId };

afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('granolaPersonalFolderSelectionHandler', () => {
  it('rejects a folder write for someone else’s connection', async () => {
    vi.mocked(listConnections).mockResolvedValue([
      OWN_CONNECTION,
      OTHER_CONNECTION,
    ]);
    const fetchProvider = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchProvider);

    await expect(
      granolaPersonalFolderSelectionHandler(
        { body: { connectionId: OTHER_CONNECTION.id, folderIds: [] } },
        context,
      ),
    ).resolves.toMatchObject({ status: 404 });
    expect(fetchProvider).not.toHaveBeenCalled();
    expect(kv.set).not.toHaveBeenCalled();
  });

  it('rejects an account without an active Twenty workspace membership', async () => {
    vi.mocked(listConnections).mockResolvedValue([
      { ...OWN_CONNECTION, workspaceMemberId: null },
    ]);
    const fetchProvider = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchProvider);

    await expect(
      granolaPersonalFolderSelectionHandler(
        { body: { connectionId: OWN_CONNECTION.id, folderIds: [] } },
        context,
      ),
    ).resolves.toMatchObject({ status: 404 });
    expect(fetchProvider).not.toHaveBeenCalled();
    expect(kv.set).not.toHaveBeenCalled();
  });

  it('marks a rejected personal key for reconnect before saving', async () => {
    vi.mocked(listConnections).mockResolvedValue([OWN_CONNECTION]);
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response(null, { status: 401 })),
    );

    await expect(
      granolaPersonalFolderSelectionHandler(
        { body: { connectionId: OWN_CONNECTION.id, folderIds: [] } },
        context,
      ),
    ).resolves.toMatchObject({ status: 404 });
    expect(reportConnectionAuthFailure).toHaveBeenCalledWith({
      connectionId: OWN_CONNECTION.id,
    });
    expect(kv.set).not.toHaveBeenCalled();
  });

  it('schedules webhook removal when the member clears their selection', async () => {
    vi.mocked(listConnections).mockResolvedValue([OWN_CONNECTION]);
    vi.mocked(enqueueJobs).mockResolvedValue({
      enqueued: true,
      logicFunctionUniversalIdentifier: 'granola-personal-reconcile',
      enqueuedJobsCount: 1,
      jobIds: [],
      jobs: [],
    });
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          Response.json({ folders: [], hasMore: false, cursor: null }),
        ),
    );

    await expect(
      granolaPersonalFolderSelectionHandler(
        { body: { connectionId: OWN_CONNECTION.id, folderIds: [] } },
        context,
      ),
    ).resolves.toEqual({ success: true, folderIds: [] });
    expect(kv.set).toHaveBeenCalledWith(
      getGranolaPersonalFolderSelectionKey(OWN_CONNECTION.id),
      [],
    );
    expect(enqueueJobs).toHaveBeenCalledOnce();
  });

  it('reports a setup failure when saved choices could not schedule reconciliation', async () => {
    vi.mocked(listConnections).mockResolvedValue([OWN_CONNECTION]);
    vi.mocked(enqueueJobs).mockRejectedValue(new Error('Queue unavailable'));
    const log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(
        Response.json({
          folders: [],
          hasMore: false,
          cursor: null,
        }),
      ),
    );

    try {
      await expect(
        granolaPersonalFolderSelectionHandler(
          { body: { connectionId: OWN_CONNECTION.id, folderIds: [] } },
          context,
        ),
      ).resolves.toMatchObject({ status: 503 });
      expect(kv.set).toHaveBeenCalledWith(
        getGranolaPersonalFolderSelectionKey(OWN_CONNECTION.id),
        [],
      );
    } finally {
      log.mockRestore();
    }
  });

  it('validates folders with the member key and timestamps new selections', async () => {
    vi.mocked(enqueueJobs).mockResolvedValue({
      enqueued: true,
      logicFunctionUniversalIdentifier: 'reconcile',
      enqueuedJobsCount: 1,
      jobIds: ['reconcile-job'],
      jobs: [],
    });
    vi.useFakeTimers();
    vi.setSystemTime(new Date(OPTED_IN_AT));
    vi.mocked(listConnections).mockResolvedValue([OWN_CONNECTION]);
    vi.mocked(kv.get).mockResolvedValue([
      { folderId: CUSTOMER_FOLDER_ID, selectedAt: SAVED_AT },
    ]);
    const fetchProvider = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        folders: [
          {
            id: CUSTOMER_FOLDER_ID,
            object: 'folder',
            name: 'Customer calls',
            parent_folder_id: null,
          },
          {
            id: PARTNER_FOLDER_ID,
            object: 'folder',
            name: 'Partner calls',
            parent_folder_id: null,
          },
        ],
        hasMore: false,
        cursor: null,
      }),
    );
    vi.stubGlobal('fetch', fetchProvider);

    await expect(
      granolaPersonalFolderSelectionHandler(
        {
          body: {
            connectionId: OWN_CONNECTION.id,
            folderIds: [CUSTOMER_FOLDER_ID, PARTNER_FOLDER_ID],
          },
        },
        context,
      ),
    ).resolves.toEqual({
      success: true,
      folderIds: [CUSTOMER_FOLDER_ID, PARTNER_FOLDER_ID],
    });
    expect(fetchProvider).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({
        headers: { Authorization: `Bearer ${OWN_CONNECTION.accessToken}` },
      }),
    );
    expect(enqueueJobs).toHaveBeenCalledWith(
      expect.objectContaining({
        jobs: [
          expect.objectContaining({
            payload: {
              connectedAccountId: OWN_CONNECTION.id,
              userWorkspaceId: OWN_CONNECTION.userWorkspaceId,
            },
          }),
        ],
      }),
    );
    expect(kv.set).toHaveBeenCalledWith(
      getGranolaPersonalFolderSelectionKey(OWN_CONNECTION.id),
      [
        { folderId: CUSTOMER_FOLDER_ID, selectedAt: SAVED_AT },
        { folderId: PARTNER_FOLDER_ID, selectedAt: OPTED_IN_AT },
      ],
    );
  });
});
