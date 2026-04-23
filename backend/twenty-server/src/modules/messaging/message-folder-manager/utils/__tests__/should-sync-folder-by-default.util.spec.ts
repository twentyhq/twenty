import { MessageFolderImportPolicy } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { shouldSyncFolderByDefault } from 'src/modules/messaging/message-folder-manager/utils/should-sync-folder-by-default.util';

describe('shouldSyncFolderByDefault', () => {
  describe('when messageFolderImportPolicy is SELECTED_FOLDERS', () => {
    it('should return false for all folders', () => {
      const result = shouldSyncFolderByDefault(
        MessageFolderImportPolicy.SELECTED_FOLDERS,
      );

      expect(result).toBe(false);
    });
  });

  describe('when messageFolderImportPolicy is ALL_FOLDERS', () => {
    it('should return true for all folders', () => {
      const result = shouldSyncFolderByDefault(
        MessageFolderImportPolicy.ALL_FOLDERS,
      );

      expect(result).toBe(true);
    });
  });
});
