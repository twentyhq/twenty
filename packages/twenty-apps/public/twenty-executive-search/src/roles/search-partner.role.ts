import { defineApplicationRole } from 'twenty-sdk/define';

import { SEARCH_PARTNER_ROLE_UNIVERSAL_IDENTIFIER } from 'src/constants/search-partner-role-universal-identifier';

export default defineApplicationRole({
  universalIdentifier: SEARCH_PARTNER_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Search Partner',
  description:
    'Assignment-scoped internal role. Can read/write search delivery records; cannot read commercial, subscription, or payment fields (enforced via field permissions applied in Phase 4).',
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
