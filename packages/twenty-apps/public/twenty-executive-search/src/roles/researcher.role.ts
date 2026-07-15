import { defineApplicationRole } from 'twenty-sdk/define';

import { RESEARCHER_ROLE_UNIVERSAL_IDENTIFIER } from 'src/constants/researcher-role-universal-identifier';

export default defineApplicationRole({
  universalIdentifier: RESEARCHER_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Researcher/Sourcer',
  description:
    'Research fields only. Can access candidate research and sourcing data; no compensation, confidential references, or client commercial terms.',
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
