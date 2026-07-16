import { defineApplicationRole } from 'twenty-sdk/define';

import { APP_DISPLAY_NAME } from 'src/constants/app-display-name';
import { DEFAULT_ROLE_UNIVERSAL_IDENTIFIER } from 'src/constants/default-role-universal-identifier';
import { SEARCH_ENGAGEMENT_TERMS_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineApplicationRole({
  universalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,

  label: `${APP_DISPLAY_NAME} default role`,
  description:
    'Least-privilege base role for the executive-search application. ' +
    'Grants no object access by default — future phases add explicit ' +
    'object and field permissions as domain records are created.',

  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToAgents: false,
  canBeAssignedToUsers: false,
  canBeAssignedToApiKeys: false,

  objectPermissions: [
    {
      objectUniversalIdentifier:
        SEARCH_ENGAGEMENT_TERMS_OBJECT_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
  ],
  fieldPermissions: [],
  permissionFlagUniversalIdentifiers: [],
});
