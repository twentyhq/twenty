import { listMessageChannels } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

export const findPageMessageChannelOrThrow = async ({
  connectedAccountId,
  pageId,
}: {
  connectedAccountId: string;
  pageId: string;
}) => {
  const messageChannel = (
    await listMessageChannels({ connectedAccountId })
  ).find(({ handle }) => handle === pageId);

  if (!isDefined(messageChannel)) {
    throw new Error(`No Messenger message channel for Page ${pageId}`);
  }

  return messageChannel;
};
