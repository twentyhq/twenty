import { PermissionFlag, defineRole } from '@/sdk';
import {
  CONTENT_FIELD_UNIVERSAL_IDENTIFIER,
  POST_CARD_UNIVERSAL_IDENTIFIER,
} from '@/cli/__tests__/apps/rich-app/src/objects/postCard.object';

export const DEFAULT_ROLE_UNIVERSAL_IDENTIFIER =
  'b648f87b-1d26-4961-b974-0908fd991061';

export default defineRole({
  universalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Default function role',
  description: 'Default role for function Twenty client',
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
      objectUniversalIdentifier: POST_CARD_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
  ],
  fieldPermissions: [
    {
      objectUniversalIdentifier: POST_CARD_UNIVERSAL_IDENTIFIER,
      fieldUniversalIdentifier: CONTENT_FIELD_UNIVERSAL_IDENTIFIER,
      canReadFieldValue: false,
      canUpdateFieldValue: false,
    },
  ],
  permissionFlags: [PermissionFlag.APPLICATIONS],
});
