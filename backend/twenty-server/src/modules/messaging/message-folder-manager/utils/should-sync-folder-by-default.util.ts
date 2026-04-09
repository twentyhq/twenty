import { MessageFolderImportPolicy } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

export const shouldSyncFolderByDefault = (
  messageFolderImportPolicy: MessageFolderImportPolicy,
): boolean => {
  return messageFolderImportPolicy === MessageFolderImportPolicy.ALL_FOLDERS;
};
