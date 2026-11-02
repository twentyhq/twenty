import { defineConnectionProvider } from 'twenty-sdk/define';

import { LINKEDIN_PROVIDER_NAME } from 'src/constants/linkedin-provider-name.constant';
import {
  LINKEDIN_AUTHORIZE_UNIVERSAL_IDENTIFIER,
  LINKEDIN_CALLBACK_UNIVERSAL_IDENTIFIER,
  LINKEDIN_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  LINKEDIN_ON_CONNECT_UNIVERSAL_IDENTIFIER,
  LINKEDIN_ON_DISCONNECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineConnectionProvider({
  universalIdentifier: LINKEDIN_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  name: LINKEDIN_PROVIDER_NAME,
  displayName: 'LinkedIn',
  type: 'custom',
  scope: 'USER',
  custom: {
    authorizeLogicFunction: {
      universalIdentifier: LINKEDIN_AUTHORIZE_UNIVERSAL_IDENTIFIER,
    },
    callbackLogicFunction: {
      universalIdentifier: LINKEDIN_CALLBACK_UNIVERSAL_IDENTIFIER,
    },
  },
  onConnectLogicFunction: {
    universalIdentifier: LINKEDIN_ON_CONNECT_UNIVERSAL_IDENTIFIER,
  },
  onDisconnectLogicFunction: {
    universalIdentifier: LINKEDIN_ON_DISCONNECT_UNIVERSAL_IDENTIFIER,
  },
});
