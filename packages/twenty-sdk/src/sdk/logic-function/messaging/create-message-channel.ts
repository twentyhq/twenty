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
  // An app connection id, from `getConnection`/`listConnections`. The channel
  // speaks through this credential and inherits who may see it.
  connectedAccountId: string;
  // This account's identity on the provider — whatever the provider calls it.
  // Inbound participants matching it are treated as the account itself.
  handle: string;
  displayName?: string;
  // Required rather than defaulted: this decides whether one member's
  // conversations are readable by the whole workspace, and only the app
  // knows how private its provider's messages are. Prefer 'METADATA' for
  // personal inboxes and 'SHARE_EVERYTHING' for shared ones.
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
