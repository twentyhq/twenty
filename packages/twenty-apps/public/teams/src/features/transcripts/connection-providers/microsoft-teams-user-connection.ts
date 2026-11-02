import { defineConnectionProvider } from 'twenty-sdk/define';

import {
  TEAMS_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
  TEAMS_TENANT_RELEASE_UNIVERSAL_IDENTIFIER,
} from 'src/features/chat/constants/universal-identifiers';
import { TEAMS_OAUTH_CONFIG } from 'src/features/transcripts/constants/teams-oauth-config';
import { TEAMS_USER_PROVIDER_NAME } from 'src/features/transcripts/constants/teams-user-provider-name';
import { TEAMS_USER_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER } from 'src/features/transcripts/constants/universal-identifiers';

export default defineConnectionProvider({
  universalIdentifier: TEAMS_USER_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  name: TEAMS_USER_PROVIDER_NAME,
  displayName: 'Microsoft Teams',
  type: 'oauth',
  scope: 'USER',
  onConnectLogicFunction: {
    universalIdentifier: TEAMS_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
  },
  onDisconnectLogicFunction: {
    universalIdentifier: TEAMS_TENANT_RELEASE_UNIVERSAL_IDENTIFIER,
  },
  oauth: TEAMS_OAUTH_CONFIG,
});
