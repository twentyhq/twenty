import { type MessageChannelVisibility } from 'twenty-shared/types';

import { APP_MESSAGE_CHANNEL_SELECTION } from '@/sdk/logic-function/messaging/message-channel-fields.constant';
import { type AppMessageChannel } from '@/sdk/logic-function/messaging/types/app-message-channel.type';
import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const UPDATE_APP_MESSAGE_CHANNEL_MUTATION = `
  mutation UpdateAppMessageChannel($input: UpdateAppMessageChannelInput!) {
    updateAppMessageChannel(input: $input) {
      ${APP_MESSAGE_CHANNEL_SELECTION}
    }
  }
`;

export type UpdateMessageChannelInput = {
  id: string;
  // Omitted leaves the current label untouched; null clears it.
  displayName?: string | null;
  // Changes who can read every message already ingested, not just the ones that follow
  visibility?: MessageChannelVisibility | `${MessageChannelVisibility}`;
  // False pauses ingestion (further ingests are rejected) without deleting the history
  isSyncEnabled?: boolean;
};

export const updateMessageChannel = async (
  input: UpdateMessageChannelInput,
): Promise<AppMessageChannel> => {
  const { updateAppMessageChannel } = await postGraphqlRequest<
    { input: UpdateMessageChannelInput },
    { updateAppMessageChannel: AppMessageChannel }
  >({
    query: UPDATE_APP_MESSAGE_CHANNEL_MUTATION,
    variables: { input },
    caller: 'updateMessageChannel',
  });

  return updateAppMessageChannel;
};
