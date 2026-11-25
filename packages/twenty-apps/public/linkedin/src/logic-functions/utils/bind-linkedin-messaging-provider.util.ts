import {
  type AppMessageChannel,
  updateMessageChannel,
} from 'twenty-sdk/logic-function';

import { LINKEDIN_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const bindLinkedinMessagingProvider = async (
  channel: Pick<
    AppMessageChannel,
    'id' | 'messagingProviderUniversalIdentifier'
  >,
): Promise<boolean> => {
  if (
    channel.messagingProviderUniversalIdentifier ===
    LINKEDIN_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER
  ) {
    return false;
  }

  await updateMessageChannel({
    id: channel.id,
    messagingProvider: {
      universalIdentifier: LINKEDIN_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER,
    },
  });

  return true;
};
