import { defineConnectionProvider } from 'twenty-sdk/define';

import { MEET_USER_PROVIDER_NAME } from 'src/constants/meet.constant';
import { MEET_OAUTH_CONFIG } from 'src/constants/meet-oauth-config.constant';
import {
  APP_DISPLAY_NAME,
  MEET_IDENTIFY_ACCOUNT_UNIVERSAL_IDENTIFIER,
  MEET_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
  MEET_UNREGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
  MEET_USER_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineConnectionProvider({
  universalIdentifier:
    MEET_USER_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  name: MEET_USER_PROVIDER_NAME,
  displayName: APP_DISPLAY_NAME,
  type: 'oauth',
  scope: 'USER',
  oauth: MEET_OAUTH_CONFIG,
  identifyAccountLogicFunction: {
    universalIdentifier: MEET_IDENTIFY_ACCOUNT_UNIVERSAL_IDENTIFIER,
  },
  onConnectLogicFunction: {
    universalIdentifier: MEET_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
  },
  onDisconnectLogicFunction: {
    universalIdentifier: MEET_UNREGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
  },
});
