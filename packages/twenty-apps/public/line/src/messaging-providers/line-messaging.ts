import { defineMessagingProvider } from 'twenty-sdk/define';

import {
  LINE_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  LINE_LOGIC_FUNCTION_MARK_THREAD_AS_READ_UNIVERSAL_IDENTIFIER,
  LINE_LOGIC_FUNCTION_SEND_MESSAGE_UNIVERSAL_IDENTIFIER,
  LINE_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineMessagingProvider({
  universalIdentifier: LINE_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER,
  name: 'line-messaging',
  displayName: 'LINE',
  conversationStyle: 'chat',
  connectionProvider: {
    universalIdentifier: LINE_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  },
  sendMessageLogicFunction: {
    universalIdentifier: LINE_LOGIC_FUNCTION_SEND_MESSAGE_UNIVERSAL_IDENTIFIER,
  },
  markThreadAsReadLogicFunction: {
    universalIdentifier:
      LINE_LOGIC_FUNCTION_MARK_THREAD_AS_READ_UNIVERSAL_IDENTIFIER,
  },
});
