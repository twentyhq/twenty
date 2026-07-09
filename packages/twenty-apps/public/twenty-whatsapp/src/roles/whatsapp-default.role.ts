import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  SystemPermissionFlag,
  defineApplicationRole,
} from 'twenty-sdk/define';

import { WHATSAPP_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineApplicationRole({
  universalIdentifier: WHATSAPP_UNIVERSAL_IDENTIFIERS.defaultRole,
  label: 'WhatsApp default role',
  description:
    'Reads people and companies to link WhatsApp conversations, and imports incoming WhatsApp messages into the workspace.',
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
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
  ],
  fieldPermissions: [],
  permissionFlagUniversalIdentifiers: [SystemPermissionFlag.SEND_EMAIL_TOOL],
});
