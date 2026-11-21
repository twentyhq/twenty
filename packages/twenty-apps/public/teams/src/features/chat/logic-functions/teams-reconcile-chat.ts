import { defineLogicFunction } from 'twenty-sdk/define';

import { TEAMS_CHAT_RECONCILE_ROUTE_PATH } from 'src/features/chat/constants/teams-chat-route-path';
import { TEAMS_RECONCILE_CHAT_UNIVERSAL_IDENTIFIER } from 'src/features/chat/constants/universal-identifiers';
import { teamsReconcileChatHandler } from 'src/features/chat/logic-functions/handlers/teams-reconcile-chat-handler';

export default defineLogicFunction({
  universalIdentifier: TEAMS_RECONCILE_CHAT_UNIVERSAL_IDENTIFIER,
  name: 'teams-reconcile-chat',
  description:
    'Runs when the Enable chat setting is saved. With chat on, claims the Microsoft tenant of every working workspace-shared connection for this workspace, as adding the connection would, without the directory email match: members link on their first message or from Auto-link by email. With chat off, releases those claims so another workspace can use the tenant. Takes the saved state in the request, never claims while chat is unreleased, and reports one outcome per connection. Restricted to members who can manage applications.',
  timeoutSeconds: 120,
  httpRouteTriggerSettings: {
    path: TEAMS_CHAT_RECONCILE_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
  handler: teamsReconcileChatHandler,
});
