import {
  createMessageChannel,
  listMessageChannels,
  updateMessageChannel,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINE_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type LineBotInfo } from 'src/logic-functions/types/line-bot-info.type';

// keyed by the bot user id so a renamed Official Account keeps its history
export const syncBotMessageChannel = async ({
  connectedAccountId,
  botInfo,
}: {
  connectedAccountId: string;
  botInfo: LineBotInfo;
}) => {
  const existingMessageChannel = (
    await listMessageChannels({ connectedAccountId })
  ).find(({ handle }) => handle === botInfo.userId);

  if (!isDefined(existingMessageChannel)) {
    await createMessageChannel({
      connectedAccountId,
      handle: botInfo.userId,
      displayName: botInfo.displayName,
      visibility: 'SHARE_EVERYTHING',
      messagingProvider: {
        universalIdentifier: LINE_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER,
      },
    });

    return;
  }

  if (existingMessageChannel.displayName !== botInfo.displayName) {
    await updateMessageChannel({
      id: existingMessageChannel.id,
      displayName: botInfo.displayName,
    });
  }
};
