import { kv, listConnections } from 'twenty-sdk/logic-function';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildGranolaNote } from 'src/__tests__/utils/build-granola-note.util';
import { OWN_CONNECTION } from 'src/__tests__/utils/granola-personal-connection-fixtures';
import { type GranolaFolder } from 'src/logic-functions/types/granola-api.type';
import { getGranolaApiKeyFingerprint } from 'src/logic-functions/utils/get-granola-api-key-fingerprint.util';
import { syncGranolaPersonalNoteOrThrow } from 'src/logic-functions/utils/sync-granola-personal-note-or-throw.util';

const { createOrUpdateRecording, queryRecordings } = vi.hoisted(() => ({
  createOrUpdateRecording: vi.fn(),
  queryRecordings: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    mutation = createOrUpdateRecording;
    query = queryRecordings;
  },
}));

vi.mock('twenty-sdk/logic-function', async (importOriginal) => ({
  ...(await importOriginal<typeof import('twenty-sdk/logic-function')>()),
  kv: { get: vi.fn() },
  listConnections: vi.fn(),
}));

const SELECTED_FOLDER: GranolaFolder = {
  id: 'fol_customerCalls1',
  name: 'Customer calls',
  object: 'folder',
  parent_folder_id: null,
};
const CHILD_FOLDER: GranolaFolder = {
  ...SELECTED_FOLDER,
  id: 'fol_partnerCalls12',
  parent_folder_id: SELECTED_FOLDER.id,
};
const GRANDCHILD_FOLDER: GranolaFolder = {
  ...CHILD_FOLDER,
  id: 'fol_onboarding1234',
  parent_folder_id: CHILD_FOLDER.id,
};
const SELECTION = [
  { folderId: SELECTED_FOLDER.id, selectedAt: '2026-09-05T09:00:00Z' },
];
const PAYLOAD = {
  scope: {
    connectionId: OWN_CONNECTION.id,
    userWorkspaceId: OWN_CONNECTION.userWorkspaceId,
  },
  apiKeyFingerprint: getGranolaApiKeyFingerprint(
    OWN_CONNECTION.accessToken ?? '',
  ),
  noteId: buildGranolaNote().id,
};

beforeEach(() => {
  queryRecordings.mockResolvedValue({ callRecordings: { edges: [] } });
});

afterEach(() => {
  vi.resetAllMocks();
  vi.unstubAllGlobals();
});

describe('syncGranolaPersonalNoteOrThrow', () => {
  it('imports a future note in an opted-in folder’s descendants', async () => {
    vi.mocked(kv.get).mockResolvedValue(SELECTION);
    vi.mocked(listConnections).mockResolvedValue([OWN_CONNECTION]);
    createOrUpdateRecording.mockResolvedValue({});
    const fetchProvider = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        Response.json(
          buildGranolaNote({
            folder_membership: [GRANDCHILD_FOLDER],
          }),
        ),
      )
      .mockResolvedValueOnce(
        Response.json({
          folders: [SELECTED_FOLDER, CHILD_FOLDER, GRANDCHILD_FOLDER],
          hasMore: false,
          cursor: null,
        }),
      );
    vi.stubGlobal('fetch', fetchProvider);

    await expect(
      syncGranolaPersonalNoteOrThrow(PAYLOAD),
    ).resolves.toMatchObject({
      created: true,
    });
    expect(createOrUpdateRecording).toHaveBeenCalledOnce();
  });

  it.each([
    { folder_membership: [], created_at: '2026-09-05T10:00:00Z' },
    {
      folder_membership: [SELECTED_FOLDER],
      created_at: '2026-09-05T08:00:00Z',
    },
  ])(
    'skips notes outside the current selection or from before opt-in',
    async (note) => {
      vi.mocked(kv.get).mockResolvedValue(SELECTION);
      vi.mocked(listConnections).mockResolvedValue([OWN_CONNECTION]);
      vi.stubGlobal(
        'fetch',
        vi
          .fn<typeof fetch>()
          .mockResolvedValue(Response.json(buildGranolaNote(note))),
      );

      await expect(
        syncGranolaPersonalNoteOrThrow(PAYLOAD),
      ).resolves.toMatchObject({
        skipped: true,
      });
      expect(createOrUpdateRecording).not.toHaveBeenCalled();
    },
  );

  it('rechecks saved folders after looking up the current connection', async () => {
    let isSelected = true;
    vi.mocked(kv.get).mockImplementation(async () =>
      isSelected ? SELECTION : null,
    );
    vi.mocked(listConnections)
      .mockResolvedValueOnce([OWN_CONNECTION])
      .mockImplementationOnce(async () => {
        isSelected = false;

        return [OWN_CONNECTION];
      });
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          Response.json(
            buildGranolaNote({ folder_membership: [SELECTED_FOLDER] }),
          ),
        ),
    );

    await expect(
      syncGranolaPersonalNoteOrThrow(PAYLOAD),
    ).resolves.toMatchObject({
      skipped: true,
    });
    expect(createOrUpdateRecording).not.toHaveBeenCalled();
  });

  it('skips a member with no selected folders without accessing Granola', async () => {
    vi.mocked(listConnections).mockResolvedValue([OWN_CONNECTION]);
    vi.mocked(kv.get).mockResolvedValue([]);
    const fetchProvider = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchProvider);

    await expect(syncGranolaPersonalNoteOrThrow(PAYLOAD)).resolves.toEqual({
      skipped: true,
    });
    expect(fetchProvider).not.toHaveBeenCalled();
    expect(createOrUpdateRecording).not.toHaveBeenCalled();
  });

  it('skips a delivery if the member disconnects during the recording lookup', async () => {
    vi.mocked(kv.get).mockResolvedValue(SELECTION);
    let isConnected = true;
    vi.mocked(listConnections).mockImplementation(async () =>
      isConnected ? [OWN_CONNECTION] : [],
    );
    queryRecordings.mockImplementationOnce(async () => {
      isConnected = false;

      return { callRecordings: { edges: [] } };
    });
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(
          Response.json(
            buildGranolaNote({ folder_membership: [SELECTED_FOLDER] }),
          ),
        ),
    );

    await expect(
      syncGranolaPersonalNoteOrThrow(PAYLOAD),
    ).resolves.toMatchObject({
      skipped: true,
    });
    expect(createOrUpdateRecording).not.toHaveBeenCalled();
  });

  it('drops stale jobs after reconnect without contacting Granola', async () => {
    vi.mocked(kv.get).mockResolvedValue(SELECTION);
    vi.mocked(listConnections).mockResolvedValue([
      { ...OWN_CONNECTION, accessToken: 'grn_replacement' },
    ]);
    const fetchProvider = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', fetchProvider);

    await expect(syncGranolaPersonalNoteOrThrow(PAYLOAD)).resolves.toEqual({
      skipped: true,
    });
    expect(fetchProvider).not.toHaveBeenCalled();
    expect(createOrUpdateRecording).not.toHaveBeenCalled();
  });
});
