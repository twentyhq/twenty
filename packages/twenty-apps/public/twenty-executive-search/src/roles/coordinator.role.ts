import { defineApplicationRole } from 'twenty-sdk/define';

import { COORDINATOR_ROLE_UNIVERSAL_IDENTIFIER } from 'src/constants/coordinator-role-universal-identifier';

export default defineApplicationRole({
  universalIdentifier: COORDINATOR_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Coordinator',
  description:
    'Scheduling and logistics access. Can manage candidate interviews and calendar coordination; no commercial or assessment data.',
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToUsers: true,
  canBeAssignedToAgents: false,
  canBeAssignedToApiKeys: false,
  objectPermissions: [],
  fieldPermissions: [],
  permissionFlagUniversalIdentifiers: [],
});
