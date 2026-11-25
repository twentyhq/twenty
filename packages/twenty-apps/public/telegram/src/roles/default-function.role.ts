import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  defineApplicationRole,
} from 'twenty-sdk/define';

import {
  DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  TELEGRAM_USER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplicationRole({
  universalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Twenty Telegram tools role',
  description:
    'Reads workspace members to check that the member connecting a Telegram account still exists, and keeps Telegram user links so a connected account is remembered and can be disconnected.',
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
  ],
  fieldPermissions: [],
  permissionFlagUniversalIdentifiers: [],
});
