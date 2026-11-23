import { defineConnectionProvider } from 'twenty-sdk/define';

import { GOOGLE_MEET_USER_PROVIDER_NAME } from 'src/constants/google-meet.constant';
import { GOOGLE_MEET_OAUTH_CONFIG } from 'src/constants/google-meet-oauth-config.constant';
import {
  APP_DISPLAY_NAME,
  GOOGLE_MEET_IDENTIFY_ACCOUNT_UNIVERSAL_IDENTIFIER,
  GOOGLE_MEET_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
  GOOGLE_MEET_UNREGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
  GOOGLE_MEET_USER_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineConnectionProvider({
  universalIdentifier:
    GOOGLE_MEET_USER_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  name: GOOGLE_MEET_USER_PROVIDER_NAME,
  displayName: APP_DISPLAY_NAME,
  type: 'oauth',
  scope: 'USER',
  oauth: GOOGLE_MEET_OAUTH_CONFIG,
  identifyAccountLogicFunction: {
    universalIdentifier: GOOGLE_MEET_IDENTIFY_ACCOUNT_UNIVERSAL_IDENTIFIER,
  },
  onConnectLogicFunction: {
    universalIdentifier: GOOGLE_MEET_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
  },
  onDisconnectLogicFunction: {
    universalIdentifier: GOOGLE_MEET_UNREGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
  },
});
