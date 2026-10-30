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
  folders: {
    externalId: string;
    name: string;
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
