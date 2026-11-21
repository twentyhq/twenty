import { defineMessagingProvider } from 'twenty-sdk/define';

import {
  MESSENGER_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  MESSENGER_LOGIC_FUNCTION_MARK_THREAD_AS_READ_UNIVERSAL_IDENTIFIER,
  MESSENGER_LOGIC_FUNCTION_SEND_MESSAGE_UNIVERSAL_IDENTIFIER,
  MESSENGER_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineMessagingProvider({
  universalIdentifier: MESSENGER_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER,
  name: 'messenger-messaging',
  displayName: 'Messenger',
  conversationStyle: 'chat',
  connectionProvider: {
    universalIdentifier: MESSENGER_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  },
  sendMessageLogicFunction: {
    universalIdentifier: MESSENGER_LOGIC_FUNCTION_SEND_MESSAGE_UNIVERSAL_IDENTIFIER,
  },
  markThreadAsReadLogicFunction: {
    universalIdentifier:
      MESSENGER_LOGIC_FUNCTION_MARK_THREAD_AS_READ_UNIVERSAL_IDENTIFIER,
  },
});
