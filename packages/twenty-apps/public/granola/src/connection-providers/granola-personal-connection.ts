import { defineConnectionProvider } from 'twenty-sdk/define';

import { GRANOLA_PERSONAL_CONNECTION_PROVIDER_NAME } from 'src/constants/granola-personal-connection.constant';
import {
  GRANOLA_PERSONAL_CONNECTION_UNIVERSAL_IDENTIFIER,
  GRANOLA_PERSONAL_DISCONNECT_UNIVERSAL_IDENTIFIER,
  GRANOLA_PERSONAL_RECONCILE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineConnectionProvider({
  universalIdentifier: GRANOLA_PERSONAL_CONNECTION_UNIVERSAL_IDENTIFIER,
  name: GRANOLA_PERSONAL_CONNECTION_PROVIDER_NAME,
  displayName: 'Granola',
  logo: 'public/logo.png',
  type: 'api-key',
  scope: 'USER',
  onConnectLogicFunction: {
    universalIdentifier: GRANOLA_PERSONAL_RECONCILE_UNIVERSAL_IDENTIFIER,
  },
  onDisconnectLogicFunction: {
    universalIdentifier: GRANOLA_PERSONAL_DISCONNECT_UNIVERSAL_IDENTIFIER,
  },
});
