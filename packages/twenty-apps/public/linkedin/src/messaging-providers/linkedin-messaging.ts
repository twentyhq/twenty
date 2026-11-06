import { defineMessagingProvider } from 'twenty-sdk/define';

import {
  LINKEDIN_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  LINKEDIN_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER,
  LINKEDIN_SEND_MESSAGE_UNIVERSAL_IDENTIFIER,
  LINKEDIN_START_CONVERSATION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

type MessagingProviderConfig = Parameters<typeof defineMessagingProvider>[0];

// startConversationLogicFunction ships in twenty-sdk 2.57; drop this type once the app pins it
const linkedinMessagingProvider: MessagingProviderConfig & {
  startConversationLogicFunction: { universalIdentifier: string };
} = {
  universalIdentifier: LINKEDIN_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-messaging',
  displayName: 'LinkedIn Messages',
  connectionProvider: {
    universalIdentifier: LINKEDIN_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  },
  sendMessageLogicFunction: {
    universalIdentifier: LINKEDIN_SEND_MESSAGE_UNIVERSAL_IDENTIFIER,
  },
  startConversationLogicFunction: {
    universalIdentifier: LINKEDIN_START_CONVERSATION_UNIVERSAL_IDENTIFIER,
  },
};

export default defineMessagingProvider(linkedinMessagingProvider);
