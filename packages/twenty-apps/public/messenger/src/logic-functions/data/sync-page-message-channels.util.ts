import {
  createMessageChannel,
  listMessageChannels,
  updateMessageChannel,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { MESSENGER_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { type MessengerPage } from 'src/logic-functions/types/messenger-page.type';

const MESSENGER_MESSAGING_PROVIDER = {
  universalIdentifier: MESSENGER_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER,
};

// one channel per Page, keyed by Page id so a renamed Page keeps its history
export const syncPageMessageChannels = async ({
  connectedAccountId,
  pages,
}: {
  connectedAccountId: string;
  pages: MessengerPage[];
}) => {
  const existingMessageChannels = await listMessageChannels({
    connectedAccountId,
  });

  for (const page of pages) {
    const existingMessageChannel = existingMessageChannels.find(
      ({ handle }) => handle === page.id,
    );

    if (!isDefined(existingMessageChannel)) {
      await createMessageChannel({
        connectedAccountId,
        handle: page.id,
        displayName: page.name,
        visibility: 'SHARE_EVERYTHING',
        messagingProvider: MESSENGER_MESSAGING_PROVIDER,
      });
      continue;
    }

    if (existingMessageChannel.displayName !== page.name) {
      await updateMessageChannel({
        id: existingMessageChannel.id,
        displayName: page.name,
      });
    }
  }
};
