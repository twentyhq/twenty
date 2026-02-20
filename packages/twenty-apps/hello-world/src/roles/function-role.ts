import { defineRole, PermissionFlag } from 'twenty-sdk';
import { POST_CARD_UNIVERSAL_IDENTIFIER } from '../objects/postCard';

export default defineRole({
  universalIdentifier: 'b648f87b-1d26-4961-b974-0908fd991061',
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
      fieldUniversalIdentifier: 'b2c37dc0-8ae7-470e-96cd-1476b47dfaff',
      canReadFieldValue: false,
      canUpdateFieldValue: false,
    },
  ],
  permissionFlags: [PermissionFlag.APPLICATIONS],
});
