import { listMessageChannels } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

// a channel is found by its id from Twenty, or by its bot user id from LINE, which is the channel handle
export const findBotMessageChannelOrThrow = async ({
  connectedAccountId,
  ...lookup
}: { connectedAccountId: string } & (
  | { messageChannelId: string }
  | { botUserId: string }
)) => {
  const messageChannel = (
    await listMessageChannels({ connectedAccountId })
  ).find((candidate) =>
    'messageChannelId' in lookup
      ? candidate.id === lookup.messageChannelId
      : candidate.handle === lookup.botUserId,
  );

  if (!isDefined(messageChannel)) {
    throw new Error(
      'messageChannelId' in lookup
        ? `LINE message channel ${lookup.messageChannelId} not found`
        : `No LINE message channel for bot ${lookup.botUserId}`,
    );
  }

  return messageChannel;
};
