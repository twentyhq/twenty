import { defineRole } from 'twenty-sdk/define';

import {
  CAN_ACCESS_RESTRICTED_DEMOGRAPHICS_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
  CAN_BYPASS_COMMERCIAL_FIREWALL_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
} from 'src/constants/permission-flag-universal-identifiers';
import { COMPLIANCE_ROLE_UNIVERSAL_IDENTIFIER } from 'src/constants/role-universal-identifiers';

export default defineRole({
  universalIdentifier: COMPLIANCE_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Executive Search — Compliance',
  description:
    'Compliance officer role. Can view restricted demographics and bypass the commercial firewall ' +
    'for audit and exception review. The bypass flag is scoped to audit/exception review only — ' +
    'not search delivery.',
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
  permissionFlagUniversalIdentifiers: [
    CAN_ACCESS_RESTRICTED_DEMOGRAPHICS_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
    CAN_BYPASS_COMMERCIAL_FIREWALL_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
  ],
});
