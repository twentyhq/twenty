import { defineConnectionProvider } from 'twenty-sdk/define';
import {
  WHATSAPP_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  WHATSAPP_LOGIC_FUNCTION_IDENTIFY_ACCOUNT_UNIVERSAL_IDENTIFIER,
  WHATSAPP_LOGIC_FUNCTION_ON_CONNECT_UNIVERSAL_IDENTIFIER,
  WHATSAPP_LOGIC_FUNCTION_ON_DISCONNECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { WHATSAPP_CONNECTION_PROVIDER_NAME } from 'src/constants/whatsapp-connection-provider-name.constant';

export default defineConnectionProvider({
  universalIdentifier: WHATSAPP_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  name: WHATSAPP_CONNECTION_PROVIDER_NAME,
  displayName: 'WhatsApp Business',
  type: 'api-key',
  scope: 'WORKSPACE',
  identifyAccountLogicFunction: {
    universalIdentifier: WHATSAPP_LOGIC_FUNCTION_IDENTIFY_ACCOUNT_UNIVERSAL_IDENTIFIER,
  },
  onConnectLogicFunction: {
    universalIdentifier: WHATSAPP_LOGIC_FUNCTION_ON_CONNECT_UNIVERSAL_IDENTIFIER,
  },
  onDisconnectLogicFunction: {
    universalIdentifier: WHATSAPP_LOGIC_FUNCTION_ON_DISCONNECT_UNIVERSAL_IDENTIFIER,
  },
});
