import { defineConnectionProvider } from 'twenty-sdk/define';

import { GOOGLE_MEET_PROVIDER_NAME } from 'src/constants/google-meet.constant';
import { GOOGLE_MEET_OAUTH_CONFIG } from 'src/constants/google-meet-oauth-config.constant';
import {
  APP_DISPLAY_NAME,
  GOOGLE_MEET_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineConnectionProvider({
  universalIdentifier: GOOGLE_MEET_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  name: GOOGLE_MEET_PROVIDER_NAME,
  displayName: APP_DISPLAY_NAME,
  type: 'oauth',
  scope: 'WORKSPACE',
  oauth: GOOGLE_MEET_OAUTH_CONFIG,
});
