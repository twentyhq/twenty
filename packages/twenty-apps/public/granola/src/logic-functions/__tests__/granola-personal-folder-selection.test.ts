import {
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

  it('validates folders with the member key and timestamps new selections', async () => {
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
    expect(kv.set).toHaveBeenCalledWith(
      getGranolaPersonalFolderSelectionKey(OWN_CONNECTION.id),
      [
        { folderId: CUSTOMER_FOLDER_ID, selectedAt: SAVED_AT },
        { folderId: PARTNER_FOLDER_ID, selectedAt: OPTED_IN_AT },
      ],
    );
  });
});
