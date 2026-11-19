import { defineConnectionProvider } from 'twenty-sdk/define';
import {
  WHATSAPP_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  WHATSAPP_LOGIC_FUNCTION_IDENTIFY_ACCOUNT_UNIVERSAL_IDENTIFIER,
  WHATSAPP_LOGIC_FUNCTION_ON_CONNECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineConnectionProvider({
  universalIdentifier: WHATSAPP_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp',
  displayName: 'WhatsApp',
  type: 'api-key',
  scope: 'WORKSPACE',
  identifyAccountLogicFunction: {
    universalIdentifier: WHATSAPP_LOGIC_FUNCTION_IDENTIFY_ACCOUNT_UNIVERSAL_IDENTIFIER,
  },
  onConnectLogicFunction: {
    universalIdentifier: WHATSAPP_LOGIC_FUNCTION_ON_CONNECT_UNIVERSAL_IDENTIFIER,
  },
});
