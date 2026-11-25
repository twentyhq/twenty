import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  SystemPermissionFlag,
  defineApplicationRole,
} from 'twenty-sdk/define';

import { TELEGRAM_ASSISTANT_CRM_OBJECT_UNIVERSAL_IDENTIFIERS } from 'src/constants/telegram-assistant-crm-object-universal-identifiers';
import {
  DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  TELEGRAM_ASSISTANT_REQUEST_OBJECT_UNIVERSAL_IDENTIFIER,
  TELEGRAM_USER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplicationRole({
  universalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Twenty Telegram tools role',
  description:
    'Reads workspace members to check that the member connecting a Telegram account still exists, and keeps Telegram user links so a connected account is remembered and can be disconnected. Tracks assistant requests received from Telegram and runs the Telegram Assistant agent as the linked member, reading and editing people, companies, opportunities, notes and tasks within the permissions of that member.',
  canReadAllObjectRecords: false,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToAgents: true,
  canBeAssignedToUsers: false,
  canBeAssignedToApiKeys: false,
  objectPermissions: [
    {
      objectUniversalIdentifier:
        STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.workspaceMember
          .universalIdentifier,
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    {
      objectUniversalIdentifier: TELEGRAM_USER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: true,
    },
    {
      objectUniversalIdentifier:
        TELEGRAM_ASSISTANT_REQUEST_OBJECT_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    ...TELEGRAM_ASSISTANT_CRM_OBJECT_UNIVERSAL_IDENTIFIERS.map(
      (objectUniversalIdentifier) => ({
        objectUniversalIdentifier,
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        canSoftDeleteObjectRecords: true,
        canDestroyObjectRecords: false,
      }),
    ),
  ],
  fieldPermissions: [],
  permissionFlagUniversalIdentifiers: [SystemPermissionFlag.AI],
});
