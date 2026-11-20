import { defineApplicationRole, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, SystemPermissionFlag } from 'twenty-sdk/define';

import {
  APP_DISPLAY_NAME,
  DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  WHATSAPP_TEMPLATE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

const READ_AND_UPDATE_OBJECT_UNIVERSAL_IDENTIFIERS = [
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.message.universalIdentifier,
  WHATSAPP_TEMPLATE_UNIVERSAL_IDENTIFIER,
];

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
      ...READ_AND_UPDATE_OBJECT_UNIVERSAL_IDENTIFIERS.map((objectUniversalIdentifier) => ({
        objectUniversalIdentifier,
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
      })),
      {
        objectUniversalIdentifier:
          STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.messageChannelMessageAssociation.universalIdentifier,
        canReadObjectRecords: true,
        canUpdateObjectRecords: false,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
      },
    ],
  },
  canUpdateAllSettings: false,
  canBeAssignedToUsers: false,
  canBeAssignedToAgents: false,
  canBeAssignedToApiKeys: false,
  canAccessAllTools: false,
  permissionFlagUniversalIdentifiers: [
    // sendInboxMessage requires the AI permission
    SystemPermissionFlag.AI,
    SystemPermissionFlag.UPLOAD_FILE,
  ],
});
