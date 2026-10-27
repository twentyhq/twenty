import { APP_MESSAGE_FOLDER_SELECTION } from '@/sdk/logic-function/messaging/message-folder-fields.constant';
import { type AppMessageFolder } from '@/sdk/logic-function/messaging/types/app-message-folder.type';
import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const SYNC_APP_MESSAGE_FOLDERS_MUTATION = `
  mutation SyncAppMessageFolders($input: SyncAppMessageFoldersInput!) {
    syncAppMessageFolders(input: $input) {
      ${APP_MESSAGE_FOLDER_SELECTION}
    }
  }
`;

export type SyncMessageFoldersInput = {
  messageChannelId: string;
  // The channel's full folder list: unknown externalIds are created, known ones renamed, missing ones removed
  // along with their message links (the messages themselves stay)
  folders: {
    externalId: string;
    name: string;
    // Omitted keeps the stored value (true for a new folder), so a provider refresh keeps members' choices
    isSynced?: boolean;
  }[];
};

export const syncMessageFolders = async (
  input: SyncMessageFoldersInput,
): Promise<AppMessageFolder[]> => {
  const { syncAppMessageFolders } = await postGraphqlRequest<
    { input: SyncMessageFoldersInput },
    { syncAppMessageFolders: AppMessageFolder[] }
  >({
    query: SYNC_APP_MESSAGE_FOLDERS_MUTATION,
    variables: { input },
    caller: 'syncMessageFolders',
  });

  return syncAppMessageFolders;
};
