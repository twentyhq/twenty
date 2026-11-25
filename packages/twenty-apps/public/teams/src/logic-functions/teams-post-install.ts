import { definePostInstallLogicFunction } from 'twenty-sdk/define';

import { POST_INSTALL_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { claimTeamsTenantsOfExistingConnections } from 'src/features/chat/logic-functions/utils/claim-teams-tenants-of-existing-connections';

export default definePostInstallLogicFunction({
  universalIdentifier: POST_INSTALL_UNIVERSAL_IDENTIFIER,
  name: 'teams-post-install',
  description:
    'Runs when the app is installed or upgraded. Claims the Microsoft tenant of every working workspace-shared connection for this workspace, so connections added before chat existed route their Teams messages here without being removed and added again.',
  timeoutSeconds: 120,
  shouldRunOnVersionUpgrade: true,
  shouldRunSynchronously: false,
  handler: claimTeamsTenantsOfExistingConnections,
});
