import { defineMessagingProvider } from 'twenty-sdk/define';

import {
  WHATSAPP_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  WHATSAPP_MARK_THREAD_AS_READ_UNIVERSAL_IDENTIFIER,
  WHATSAPP_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER,
  WHATSAPP_SEND_MESSAGE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineMessagingProvider({
  universalIdentifier: WHATSAPP_MESSAGING_PROVIDER_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-messaging',
  displayName: 'WhatsApp Messages',
  connectionProvider: {
    universalIdentifier: WHATSAPP_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  },
  sendMessageLogicFunction: {
    universalIdentifier: WHATSAPP_SEND_MESSAGE_UNIVERSAL_IDENTIFIER,
  },
  markThreadAsReadLogicFunction: {
    universalIdentifier: WHATSAPP_MARK_THREAD_AS_READ_UNIVERSAL_IDENTIFIER,
  },
});
