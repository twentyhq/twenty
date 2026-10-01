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

// Also deletes the channel's ingested messages and emptied threads; call from onDisconnect to retire a channel with its credential.
// To stop ingesting but keep the history, set `isSyncEnabled` to false instead.
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
