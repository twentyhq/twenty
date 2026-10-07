import { TEAMS_CONNECTED_ACCOUNT_TENANT_KV_KEY_PREFIX } from 'src/features/chat/logic-functions/constants/teams-connected-account-tenant-kv-key-prefix';

export const buildTeamsConnectedAccountTenantKvKey = (
  connectedAccountId: string,
): string =>
  `${TEAMS_CONNECTED_ACCOUNT_TENANT_KV_KEY_PREFIX}:${connectedAccountId}`;
