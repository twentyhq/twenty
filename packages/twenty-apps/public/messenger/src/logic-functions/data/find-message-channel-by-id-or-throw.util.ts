import { listMessageChannels } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

export const findMessageChannelByIdOrThrow = async ({
  connectedAccountId,
  messageChannelId,
}: {
  connectedAccountId: string;
  messageChannelId: string;
}) => {
  const messageChannel = (
    await listMessageChannels({ connectedAccountId })
  ).find(({ id }) => id === messageChannelId);

  if (!isDefined(messageChannel)) {
    throw new Error(`Messenger message channel ${messageChannelId} not found`);
  }

  return messageChannel;
};
