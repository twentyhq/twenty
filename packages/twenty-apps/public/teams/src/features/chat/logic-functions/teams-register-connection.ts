import { defineLogicFunction } from 'twenty-sdk/define';

import { TEAMS_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER } from 'src/features/chat/constants/universal-identifiers';
import { type TeamsConnectionHookPayload } from 'src/features/chat/logic-functions/types/teams-connection-hook-payload.type';
import { registerTeamsConnection } from 'src/features/chat/logic-functions/utils/register-teams-connection';

export default defineLogicFunction({
  universalIdentifier: TEAMS_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
  name: 'teams-register-connection',
  description:
    'Runs when a Microsoft Teams connection is added. For a workspace-shared connection with chat enabled, reads the Microsoft tenant id from Graph and claims it for this workspace under the server-scoped teams-tenant:<tenant_id> key, so activities from that tenant route here. Personal connections are left alone.',
  timeoutSeconds: 30,
  handler: ({ connectedAccountId }: TeamsConnectionHookPayload) =>
    registerTeamsConnection({ connectedAccountId }),
});
