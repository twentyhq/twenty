import { defineRole } from 'twenty-sdk/define';

import { TEAMS_ASSISTANT_CRM_OBJECT_PERMISSIONS } from 'src/features/chat/constants/teams-assistant-crm-object-permissions';
import { TEAMS_ASSISTANT_ROLE_UNIVERSAL_IDENTIFIER } from 'src/features/chat/constants/universal-identifiers';

export default defineRole({
  universalIdentifier: TEAMS_ASSISTANT_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Teams Assistant',
  description:
    'Role of the Teams assistant agent. Covers people, companies, opportunities, notes and tasks; the agent always runs as the workspace member who sent the message, so it never gets more than that member can do.',
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToAgents: true,
  canBeAssignedToUsers: false,
  canBeAssignedToApiKeys: false,
  objectPermissions: TEAMS_ASSISTANT_CRM_OBJECT_PERMISSIONS,
  fieldPermissions: [],
  permissionFlagUniversalIdentifiers: [],
});
