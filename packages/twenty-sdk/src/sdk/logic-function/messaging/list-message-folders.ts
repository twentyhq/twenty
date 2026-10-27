import { APP_MESSAGE_FOLDER_SELECTION } from '@/sdk/logic-function/messaging/message-folder-fields.constant';
import { type AppMessageFolder } from '@/sdk/logic-function/messaging/types/app-message-folder.type';
import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const LIST_APP_MESSAGE_FOLDERS_QUERY = `
  query ListAppMessageFolders($messageChannelId: UUID!) {
    appMessageFolders(messageChannelId: $messageChannelId) {
      ${APP_MESSAGE_FOLDER_SELECTION}
    }
  }
`;

export const listMessageFolders = async (
  messageChannelId: string,
): Promise<AppMessageFolder[]> => {
  const { appMessageFolders } = await postGraphqlRequest<
    { messageChannelId: string },
    { appMessageFolders: AppMessageFolder[] }
  >({
    query: LIST_APP_MESSAGE_FOLDERS_QUERY,
    variables: { messageChannelId },
    caller: 'listMessageFolders',
  });

  return appMessageFolders;
};
