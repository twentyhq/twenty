import { defineRole } from 'twenty-sdk/define';

import { RESEARCHER_ROLE_UNIVERSAL_IDENTIFIER } from 'src/constants/role-universal-identifiers';

export default defineRole({
  universalIdentifier: RESEARCHER_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Executive Search — Researcher',
  description:
    'Research-only role for executive search. Grants access to research fields and public profiles. ' +
    'Explicitly denied access to all commercial, demographic, medical, and legacy-AI fields. ' +
    'No permission flags granted.',
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
  // Field-level denies for all prohibited selectors are configured via the
  // commercial-selection firewall registry (see src/firewall/firewall-registry.ts).
  // Once executiveProfile fields exist, fieldPermissions will enforce these.
});
