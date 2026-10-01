import { APP_MESSAGE_CHANNEL_SELECTION } from '@/sdk/logic-function/messaging/message-channel-fields.constant';
import { type AppMessageChannel } from '@/sdk/logic-function/messaging/types/app-message-channel.type';
import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const DELETE_APP_MESSAGE_CHANNEL_MUTATION = `
  mutation DeleteAppMessageChannel($id: UUID!) {
    deleteAppMessageChannel(id: $id) {
      ${APP_MESSAGE_CHANNEL_SELECTION}
    }
  }
`;

// Also deletes ingested messages and emptied threads; set `isSyncEnabled` to false to keep the history
export const deleteMessageChannel = async (
  id: string,
): Promise<AppMessageChannel> => {
  const { deleteAppMessageChannel } = await postGraphqlRequest<
    { id: string },
    { deleteAppMessageChannel: AppMessageChannel }
  >({
    query: DELETE_APP_MESSAGE_CHANNEL_MUTATION,
    variables: { id },
    caller: 'deleteMessageChannel',
  });

  return deleteAppMessageChannel;
};
