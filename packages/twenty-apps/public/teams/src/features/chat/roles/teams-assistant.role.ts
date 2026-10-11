import { defineRole } from 'twenty-sdk/define';

import { TEAMS_ASSISTANT_ROLE_UNIVERSAL_IDENTIFIER } from 'src/features/chat/constants/universal-identifiers';

export default defineRole({
  universalIdentifier: TEAMS_ASSISTANT_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Teams Assistant',
  description:
    'Role of the Teams assistant agent. Grants nothing on its own: the agent always runs as the workspace member who sent the message, and its CRM tools follow the role of that member.',
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToAgents: true,
  canBeAssignedToUsers: false,
  canBeAssignedToApiKeys: false,
  objectPermissions: [],
  fieldPermissions: [],
  permissionFlagUniversalIdentifiers: [],
});
