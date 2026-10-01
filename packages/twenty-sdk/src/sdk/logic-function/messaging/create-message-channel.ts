import { type MessageChannelVisibility } from 'twenty-shared/types';

import { APP_MESSAGE_CHANNEL_SELECTION } from '@/sdk/logic-function/messaging/message-channel-fields.constant';
import { type AppMessageChannel } from '@/sdk/logic-function/messaging/types/app-message-channel.type';
import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const CREATE_APP_MESSAGE_CHANNEL_MUTATION = `
  mutation CreateAppMessageChannel($input: CreateAppMessageChannelInput!) {
    createAppMessageChannel(input: $input) {
      ${APP_MESSAGE_CHANNEL_SELECTION}
    }
  }
`;

export type CreateMessageChannelInput = {
  // An app connection id; the channel speaks through this credential and inherits who may see it
  connectedAccountId: string;
  // The account's provider identity; inbound participants matching it are treated as the account itself
  handle: string;
  displayName?: string;
  // Required: only the app knows how private its messages are ('METADATA' for personal, 'SHARE_EVERYTHING' for shared)
  visibility: MessageChannelVisibility;
};

export const createMessageChannel = async (
  input: CreateMessageChannelInput,
): Promise<AppMessageChannel> => {
  const { createAppMessageChannel } = await postGraphqlRequest<
    { input: CreateMessageChannelInput },
    { createAppMessageChannel: AppMessageChannel }
  >({
    query: CREATE_APP_MESSAGE_CHANNEL_MUTATION,
    variables: { input },
    caller: 'createMessageChannel',
  });

  return createAppMessageChannel;
};
