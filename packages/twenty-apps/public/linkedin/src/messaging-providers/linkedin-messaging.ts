import { defineMessagingProvider } from 'twenty-sdk/define';

import {
  LINKEDIN_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  LINKEDIN_MARK_THREAD_AS_READ_UNIVERSAL_IDENTIFIER,
  LINKEDIN_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER,
  LINKEDIN_SEND_MESSAGE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// The pinned twenty-sdk 2.57 does not type markThreadAsReadLogicFunction; inline it once the pin reaches 2.59.
const linkedinMessagingProvider: Parameters<
  typeof defineMessagingProvider
>[0] & {
  markThreadAsReadLogicFunction: { universalIdentifier: string };
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
  markThreadAsReadLogicFunction: {
    universalIdentifier: LINKEDIN_MARK_THREAD_AS_READ_UNIVERSAL_IDENTIFIER,
  },
};

export default defineMessagingProvider(linkedinMessagingProvider);
