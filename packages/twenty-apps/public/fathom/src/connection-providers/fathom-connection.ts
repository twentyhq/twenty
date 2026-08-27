import { defineConnectionProvider } from 'twenty-sdk/define';

import { FATHOM_PROVIDER_NAME } from 'src/constants/fathom.constant';
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
  onConnectLogicFunction: {
    universalIdentifier: FATHOM_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
  },
  onDisconnectLogicFunction: {
    universalIdentifier: FATHOM_DISCONNECT_UNIVERSAL_IDENTIFIER,
  },
  oauth: {
    authorizationEndpoint: 'https://fathom.video/external/v1/oauth2/authorize',
    tokenEndpoint: 'https://api.fathom.ai/external/v1/oauth2/token',
    scopes: ['public_api'],
    clientIdVariable: 'FATHOM_CLIENT_ID',
    clientSecretVariable: 'FATHOM_CLIENT_SECRET',
    tokenRequestContentType: 'form-urlencoded',
    usePkce: false,
  },
});
