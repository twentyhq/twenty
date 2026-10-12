import { TEAMS_TENANT_KV_KEY_PREFIX } from 'src/features/chat/logic-functions/constants/teams-tenant-kv-key-prefix';

export const buildTeamsTenantKvKey = (tenantId: string): string =>
  `${TEAMS_TENANT_KV_KEY_PREFIX}:${tenantId}`;
