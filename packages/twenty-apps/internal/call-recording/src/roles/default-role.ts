import { defineRole, SystemPermissionFlag } from 'twenty-sdk/define';

export const DEFAULT_ROLE_UNIVERSAL_IDENTIFIER =
  'f9cfb3ce-cb1e-4f55-af85-be45f6059054';

export default defineRole({
  universalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Call recording default function role',
  description: 'Call recording default function role',
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: true,
  canDestroyAllObjectRecords: false,
  permissionFlagUniversalIdentifiers: [
    SystemPermissionFlag.UPLOAD_FILE,
    SystemPermissionFlag.AI,
  ],
});
