import { APP_MESSAGE_CHANNEL_SELECTION } from '@/sdk/logic-function/messaging/message-channel-fields.constant';
import { type AppMessageChannel } from '@/sdk/logic-function/messaging/types/app-message-channel.type';
import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const LIST_APP_MESSAGE_CHANNELS_QUERY = `
  query ListAppMessageChannels($filter: ListAppMessageChannelsInput) {
    appMessageChannels(filter: $filter) {
      ${APP_MESSAGE_CHANNEL_SELECTION}
    }
  }
`;

export type ListMessageChannelsFilter = {
  connectedAccountId?: string;
};

export const listMessageChannels = async (
  filter: ListMessageChannelsFilter = {},
): Promise<AppMessageChannel[]> => {
  const { appMessageChannels } = await postGraphqlRequest<
    { filter: ListMessageChannelsFilter },
    { appMessageChannels: AppMessageChannel[] }
  >({
    query: LIST_APP_MESSAGE_CHANNELS_QUERY,
    variables: { filter },
    caller: 'listMessageChannels',
  });

  return appMessageChannels;
};
