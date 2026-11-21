import { listMessageChannels } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

// a Page's channel is found by its id from Twenty, or by its Page id from Meta, which is the channel handle
export const findMessageChannelOrThrow = async ({
  connectedAccountId,
  ...lookup
}: { connectedAccountId: string } & (
  | { messageChannelId: string }
  | { pageId: string }
)) => {
  const messageChannel = (
    await listMessageChannels({ connectedAccountId })
  ).find((candidate) =>
    'messageChannelId' in lookup
      ? candidate.id === lookup.messageChannelId
      : candidate.handle === lookup.pageId,
  );

  if (!isDefined(messageChannel)) {
    throw new Error(
      'messageChannelId' in lookup
        ? `Messenger message channel ${lookup.messageChannelId} not found`
        : `No Messenger message channel for Page ${lookup.pageId}`,
    );
  }

  return messageChannel;
};
