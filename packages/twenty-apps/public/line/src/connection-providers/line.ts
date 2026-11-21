import { defineConnectionProvider } from 'twenty-sdk/define';

import { LINE_CONNECTION_PROVIDER_NAME } from 'src/constants/line-connection-provider-name.constant';
import {
  LINE_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  LINE_LOGIC_FUNCTION_IDENTIFY_ACCOUNT_UNIVERSAL_IDENTIFIER,
  LINE_LOGIC_FUNCTION_ON_CONNECT_UNIVERSAL_IDENTIFIER,
  LINE_LOGIC_FUNCTION_ON_DISCONNECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

// holds the long-lived channel access token, which never expires
export default defineConnectionProvider({
  universalIdentifier: LINE_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  name: LINE_CONNECTION_PROVIDER_NAME,
  displayName: 'LINE',
  type: 'api-key',
  scope: 'WORKSPACE',
  identifyAccountLogicFunction: {
    universalIdentifier: LINE_LOGIC_FUNCTION_IDENTIFY_ACCOUNT_UNIVERSAL_IDENTIFIER,
  },
  onConnectLogicFunction: {
    universalIdentifier: LINE_LOGIC_FUNCTION_ON_CONNECT_UNIVERSAL_IDENTIFIER,
  },
  onDisconnectLogicFunction: {
    universalIdentifier: LINE_LOGIC_FUNCTION_ON_DISCONNECT_UNIVERSAL_IDENTIFIER,
  },
});
