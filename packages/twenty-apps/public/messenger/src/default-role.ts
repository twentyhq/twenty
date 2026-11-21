import {
  defineApplicationRole,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  SystemPermissionFlag,
} from 'twenty-sdk/define';

import {
  APP_DISPLAY_NAME,
  DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplicationRole({
  universalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  label: `${APP_DISPLAY_NAME} default function role`,
  description: `${APP_DISPLAY_NAME} default function role`,
  recordsPermissions: {
    canReadAllRecords: false,
    canUpdateAllRecords: false,
    canSoftDeleteAllRecords: false,
    canDestroyAllRecords: false,
    objects: [
      {
        objectUniversalIdentifier:
          STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
        canReadAllRecords: true,
        canUpdateAllRecords: true,
        canSoftDeleteAllRecords: false,
        canDestroyAllRecords: false,
      },
      {
        objectUniversalIdentifier:
          STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
        canReadAllRecords: true,
        canUpdateAllRecords: true,
        canSoftDeleteAllRecords: false,
        canDestroyAllRecords: false,
      },
      {
        objectUniversalIdentifier:
          STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.messageChannelMessageAssociation
            .universalIdentifier,
        canReadAllRecords: true,
        canUpdateAllRecords: false,
        canSoftDeleteAllRecords: false,
        canDestroyAllRecords: false,
      },
      {
        objectUniversalIdentifier:
          STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.message.universalIdentifier,
        canReadAllRecords: true,
        canUpdateAllRecords: true,
        canSoftDeleteAllRecords: false,
        canDestroyAllRecords: false,
      },
    ],
  },
  canUpdateAllSettings: false,
  canBeAssignedToUsers: false,
  canBeAssignedToAgents: false,
  canBeAssignedToApiKeys: false,
  canAccessAllTools: false,
  permissionFlagUniversalIdentifiers: [SystemPermissionFlag.UPLOAD_FILE],
});
