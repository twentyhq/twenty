import { TEAMS_TENANT_CLAIM_CONFLICT_KV_KEY_PREFIX } from 'src/features/chat/logic-functions/constants/teams-tenant-claim-conflict-kv-key-prefix';

export const buildTeamsTenantClaimConflictKvKey = (
  connectedAccountId: string,
): string =>
  `${TEAMS_TENANT_CLAIM_CONFLICT_KV_KEY_PREFIX}:${connectedAccountId}`;
