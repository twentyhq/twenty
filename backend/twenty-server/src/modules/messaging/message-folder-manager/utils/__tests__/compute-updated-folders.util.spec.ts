import { MessageFolderPendingSyncAction } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { computeUpdatedFolders } from 'src/modules/messaging/message-folder-manager/utils/compute-updated-folders.util';

describe('computeUpdatedFolders', () => {
  it('should apply updates and set correct pendingSyncAction', () => {
    const existingFolders = [
      {
        id: 'folder-1',
        name: 'Old Name',
        externalId: 'ext-1',
        isSynced: true,
        isSentFolder: false,
        parentFolderId: null,
        syncCursor: 'cursor',
        pendingSyncAction: MessageFolderPendingSyncAction.NONE,
      },
      {
        id: 'folder-2',
        name: 'To Delete',
        externalId: 'ext-2',
        isSynced: true,
        isSentFolder: false,
        parentFolderId: null,
        syncCursor: 'cursor',
        pendingSyncAction: MessageFolderPendingSyncAction.NONE,
      },
      {
        id: 'folder-3',
        name: 'Unchanged',
        externalId: 'ext-3',
        isSynced: true,
        isSentFolder: false,
        parentFolderId: null,
        syncCursor: 'cursor',
        pendingSyncAction: MessageFolderPendingSyncAction.NONE,
      },
    ];

    const foldersToUpdate = new Map([['folder-1', { name: 'New Name' }]]);
    const folderIdsToDelete = ['folder-2'];

    const result = computeUpdatedFolders({
      existingFolders,
      foldersToUpdate,
      folderIdsToDelete,
    });

    expect(result[0].name).toBe('New Name');
    expect(result[0].pendingSyncAction).toBe(
      MessageFolderPendingSyncAction.NONE,
    );

    expect(result[1].pendingSyncAction).toBe(
      MessageFolderPendingSyncAction.FOLDER_DELETION,
    );

    expect(result[2].name).toBe('Unchanged');
    expect(result[2].pendingSyncAction).toBe(
      MessageFolderPendingSyncAction.NONE,
    );
  });

  it('should preserve existing properties when applying partial updates', () => {
    const existingFolders = [
      {
        id: 'folder-1',
        name: 'Original',
        externalId: 'ext-1',
        isSynced: true,
        isSentFolder: true,
        parentFolderId: 'parent-123',
        syncCursor: 'cursor-abc',
        pendingSyncAction: MessageFolderPendingSyncAction.NONE,
      },
    ];

    const foldersToUpdate = new Map([['folder-1', { name: 'Updated' }]]);

    const result = computeUpdatedFolders({
      existingFolders,
      foldersToUpdate,
      folderIdsToDelete: [],
    });

    expect(result[0].name).toBe('Updated');
    expect(result[0].isSentFolder).toBe(true);
    expect(result[0].parentFolderId).toBe('parent-123');
    expect(result[0].syncCursor).toBe('cursor-abc');
  });
});
