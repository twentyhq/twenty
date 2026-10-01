import { TEAMS_CONNECTOR_TOKEN_KV_KEY_PREFIX } from 'src/features/chat/logic-functions/constants/teams-connector-token-kv-key-prefix';

export const buildTeamsConnectorTokenKvKey = (appId: string): string =>
  `${TEAMS_CONNECTOR_TOKEN_KV_KEY_PREFIX}:${appId}`;
