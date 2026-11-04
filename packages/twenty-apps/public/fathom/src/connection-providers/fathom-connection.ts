import { defineConnectionProvider } from 'twenty-sdk/define';

import { FATHOM_PROVIDER_NAME } from 'src/constants/fathom.constant';
import { FATHOM_OAUTH_CONFIG } from 'src/constants/fathom-oauth-config.constant';
import {
  FATHOM_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  FATHOM_DISCONNECT_UNIVERSAL_IDENTIFIER,
  FATHOM_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineConnectionProvider({
  universalIdentifier: FATHOM_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  name: FATHOM_PROVIDER_NAME,
  displayName: 'Fathom',
  type: 'oauth',
  scope: 'WORKSPACE',
  onConnectLogicFunction: {
    universalIdentifier: FATHOM_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
  },
  onDisconnectLogicFunction: {
    universalIdentifier: FATHOM_DISCONNECT_UNIVERSAL_IDENTIFIER,
  },
  oauth: FATHOM_OAUTH_CONFIG,
});
