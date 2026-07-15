import { defineRole } from 'twenty-sdk/define';

import { PARTNER_ROLE_UNIVERSAL_IDENTIFIER } from 'src/constants/role-universal-identifiers';

export default defineRole({
  universalIdentifier: PARTNER_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Executive Search — Partner',
  description:
    'Search delivery role for managing partners. Grants access to assignments, specifications, ' +
    'research, candidacy, and slates. Elevated compared to researcher but still denied all ' +
    'commercial, demographic, and medical data. No permission flags granted.',
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
  // Same field denial map as researcher — no commercial, demographic, or medical data.
});
