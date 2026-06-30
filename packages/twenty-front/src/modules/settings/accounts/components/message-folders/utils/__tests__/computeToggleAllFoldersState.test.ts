import { type MessageFolder } from '@/accounts/types/MessageFolder';
import { computeToggleAllFoldersState } from '@/settings/accounts/components/message-folders/utils/computeToggleAllFoldersState';
import { MessageFolderPendingSyncAction } from 'twenty-shared/types';

const createFolder = (id: string, isSynced: boolean): MessageFolder => ({
  __typename: 'MessageFolder',
  id,
  name: id,
  isSynced,
  isSentFolder: false,
  parentFolderId: null,
  externalId: id,
  pendingSyncAction: MessageFolderPendingSyncAction.NONE,
  messageChannelId: 'channel-1',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
});

describe('computeToggleAllFoldersState', () => {
  it('should target syncing when no folder is synced', () => {
    const result = computeToggleAllFoldersState([
      createFolder('a', false),
      createFolder('b', false),
    ]);

    expect(result.allSynced).toBe(false);
    expect(result.targetSyncState).toBe(true);
    expect(result.messageFolderIds).toEqual(['a', 'b']);
  });

  it('should target unsyncing when every folder is synced', () => {
    const result = computeToggleAllFoldersState([
      createFolder('a', true),
      createFolder('b', true),
    ]);

    expect(result.allSynced).toBe(true);
    expect(result.targetSyncState).toBe(false);
  });

  it('should target syncing when only some folders are synced', () => {
    const result = computeToggleAllFoldersState([
      createFolder('a', true),
      createFolder('b', false),
    ]);

    expect(result.allSynced).toBe(false);
    expect(result.targetSyncState).toBe(true);
  });

  // Bug #21840 follow-up: "Toggle all folders" reflects the whole account, so a
  // single synced folder among unsynced ones must not report "all synced" — even
  // when a search filter hides the unsynced ones from view.
  it('should report not-all-synced when one folder is synced among unsynced ones', () => {
    const result = computeToggleAllFoldersState([
      createFolder('archive', true),
      createFolder('clients', false),
    ]);

    expect(result.allSynced).toBe(false);
    expect(result.messageFolderIds).toEqual(['archive', 'clients']);
  });

  it('should not report all synced for an empty set', () => {
    const result = computeToggleAllFoldersState([]);

    expect(result.allSynced).toBe(false);
    expect(result.messageFolderIds).toEqual([]);
    expect(result.targetSyncState).toBe(true);
  });
});
