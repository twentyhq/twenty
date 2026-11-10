import { defineMessagingProvider } from 'twenty-sdk/define';

import {
  LINKEDIN_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  LINKEDIN_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER,
  LINKEDIN_SEND_MESSAGE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// the pinned twenty-sdk does not type `canSendAttachments` yet
const linkedinMessagingProvider: Parameters<
  typeof defineMessagingProvider
>[0] & { canSendAttachments: boolean } = {
  universalIdentifier: LINKEDIN_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-messaging',
  displayName: 'LinkedIn Messages',
  connectionProvider: {
    universalIdentifier: LINKEDIN_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  },
  sendMessageLogicFunction: {
    universalIdentifier: LINKEDIN_SEND_MESSAGE_UNIVERSAL_IDENTIFIER,
  },
  canSendAttachments: true,
};

export default defineMessagingProvider(linkedinMessagingProvider);
