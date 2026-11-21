import { defineConnectionProvider } from 'twenty-sdk/define';

import {
  MESSENGER_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  MESSENGER_LOGIC_FUNCTION_IDENTIFY_ACCOUNT_UNIVERSAL_IDENTIFIER,
  MESSENGER_LOGIC_FUNCTION_ON_CONNECT_UNIVERSAL_IDENTIFIER,
  MESSENGER_LOGIC_FUNCTION_ON_DISCONNECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// Facebook OAuth issues no refresh token, so the connection holds a non-expiring system user token
export default defineConnectionProvider({
  universalIdentifier: MESSENGER_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  name: 'messenger',
  displayName: 'Messenger',
  type: 'api-key',
  scope: 'WORKSPACE',
  identifyAccountLogicFunction: {
    universalIdentifier:
      MESSENGER_LOGIC_FUNCTION_IDENTIFY_ACCOUNT_UNIVERSAL_IDENTIFIER,
  },
  onConnectLogicFunction: {
    universalIdentifier: MESSENGER_LOGIC_FUNCTION_ON_CONNECT_UNIVERSAL_IDENTIFIER,
  },
  onDisconnectLogicFunction: {
    universalIdentifier:
      MESSENGER_LOGIC_FUNCTION_ON_DISCONNECT_UNIVERSAL_IDENTIFIER,
  },
});
