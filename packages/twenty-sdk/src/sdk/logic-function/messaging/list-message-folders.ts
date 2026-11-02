import { APP_MESSAGE_FOLDER_SELECTION } from '@/sdk/logic-function/messaging/message-folder-fields.constant';
import { type AppMessageFolder } from '@/sdk/logic-function/messaging/types/app-message-folder.type';
import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const LIST_APP_MESSAGE_FOLDERS_QUERY = `
  query ListAppMessageFolders($filter: ListAppMessageFoldersInput) {
    appMessageFolders(filter: $filter) {
      ${APP_MESSAGE_FOLDER_SELECTION}
    }
  }
`;

export type ListMessageFoldersFilter = {
  messageChannelId?: string;
};

export const listMessageFolders = async (
  filter: ListMessageFoldersFilter = {},
): Promise<AppMessageFolder[]> => {
  const { appMessageFolders } = await postGraphqlRequest<
    { filter: ListMessageFoldersFilter },
    { appMessageFolders: AppMessageFolder[] }
  >({
    query: LIST_APP_MESSAGE_FOLDERS_QUERY,
    variables: { filter },
    caller: 'listMessageFolders',
  });

  return appMessageFolders;
};
