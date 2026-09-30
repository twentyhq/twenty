import { defineLogicFunction } from 'twenty-sdk/define';

import { TEAMS_TENANT_RELEASE_UNIVERSAL_IDENTIFIER } from 'src/features/chat/constants/universal-identifiers';
import { type TeamsConnectionHookPayload } from 'src/features/chat/logic-functions/types/teams-connection-hook-payload.type';
import { releaseTeamsConnectionTenant } from 'src/features/chat/logic-functions/utils/release-teams-connection-tenant';

export default defineLogicFunction({
  universalIdentifier: TEAMS_TENANT_RELEASE_UNIVERSAL_IDENTIFIER,
  name: 'teams-tenant-release',
  description:
    'Runs when a Microsoft Teams connection is removed. Releases the teams-tenant:<tenant_id> claim that connection took, unless another connection in this workspace still holds the same tenant, so another workspace can connect it.',
  timeoutSeconds: 30,
  handler: ({ connectedAccountId }: TeamsConnectionHookPayload) =>
    releaseTeamsConnectionTenant({ connectedAccountId }),
});
