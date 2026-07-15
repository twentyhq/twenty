import { defineApplicationRole } from 'twenty-sdk/define';

import { APP_DISPLAY_NAME } from 'src/constants/app-display-name';
import { DEFAULT_ROLE_UNIVERSAL_IDENTIFIER } from 'src/constants/default-role-universal-identifier';

export default defineApplicationRole({
  universalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,

  label: `${APP_DISPLAY_NAME} default role`,
  description:
    'Least-privilege base role for the executive-search application. ' +
    'Grants no object access by default — future phases add explicit ' +
    'object and field permissions as domain records are created. ' +
    'Explicitly denies all commercial-firewall permission flags (CAN_BYPASS_COMMERCIAL_FIREWALL, CAN_VIEW_COMMERCIAL_DATA, CAN_ACCESS_RESTRICTED_DEMOGRAPHICS).',

  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToAgents: false,
  canBeAssignedToUsers: false,
  canBeAssignedToApiKeys: false,

  objectPermissions: [],
  fieldPermissions: [],
  // Explicitly denies all 3 commercial-firewall permission flags:
  // CAN_BYPASS_COMMERCIAL_FIREWALL, CAN_VIEW_COMMERCIAL_DATA,
  // CAN_ACCESS_RESTRICTED_DEMOGRAPHICS.
  permissionFlagUniversalIdentifiers: [],
});
