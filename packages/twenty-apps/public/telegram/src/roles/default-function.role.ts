import { SystemPermissionFlag, defineApplicationRole } from 'twenty-sdk/define';

import {
  DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  TELEGRAM_USER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplicationRole({
  universalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Twenty Telegram tools role',
  description:
    'Reads workspace members to check that the member connecting a Telegram account still exists, and keeps Telegram user links so a connected account is remembered and can be disconnected. Tracks assistant requests received from Telegram and runs the Telegram Assistant agent as the linked member, reading and editing the records of any object, custom ones included, within the permissions of that member. Uploads a photo or PDF a member sends so the agent can read it. Only Telegram user links are ever permanently deleted.',
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: true,
  canDestroyAllObjectRecords: false,
  canUpdateAllSettings: false,
  canBeAssignedToAgents: true,
  canBeAssignedToUsers: false,
  canBeAssignedToApiKeys: false,
  objectPermissions: [
    {
      objectUniversalIdentifier: TELEGRAM_USER_LINK_OBJECT_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: true,
    },
  ],
  fieldPermissions: [],
  permissionFlagUniversalIdentifiers: [
    SystemPermissionFlag.AI,
    SystemPermissionFlag.UPLOAD_FILE,
  ],
});
