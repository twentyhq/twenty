import { defineConnectionProvider } from 'twenty-sdk/define';

import { WHATSAPP_PROVIDER_NAME } from 'src/constants/whatsapp-provider-name.constant';
import {
  WHATSAPP_AUTHORIZE_UNIVERSAL_IDENTIFIER,
  WHATSAPP_CALLBACK_UNIVERSAL_IDENTIFIER,
  WHATSAPP_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  WHATSAPP_ON_CONNECT_UNIVERSAL_IDENTIFIER,
  WHATSAPP_ON_DISCONNECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineConnectionProvider({
  universalIdentifier: WHATSAPP_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  name: WHATSAPP_PROVIDER_NAME,
  displayName: 'WhatsApp',
  type: 'custom',
  scope: 'USER',
  logo: 'public/whatsapp-logomark.svg',
  via: {
    name: 'Unipile',
    description: 'Connects your WhatsApp account and syncs its messages.',
    logo: 'public/unipile-logomark.svg',
    url: 'https://www.unipile.com',
  },
  custom: {
    authorizeLogicFunction: {
      universalIdentifier: WHATSAPP_AUTHORIZE_UNIVERSAL_IDENTIFIER,
    },
    callbackLogicFunction: {
      universalIdentifier: WHATSAPP_CALLBACK_UNIVERSAL_IDENTIFIER,
    },
  },
  onConnectLogicFunction: {
    universalIdentifier: WHATSAPP_ON_CONNECT_UNIVERSAL_IDENTIFIER,
  },
  onDisconnectLogicFunction: {
    universalIdentifier: WHATSAPP_ON_DISCONNECT_UNIVERSAL_IDENTIFIER,
  },
});
