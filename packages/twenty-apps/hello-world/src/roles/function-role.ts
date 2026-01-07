import { PermissionFlag, type RoleConfig } from 'twenty-sdk';

export const functionRole: RoleConfig = {
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
      objectNameSingular: 'postCard',
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
  ],
  fieldPermissions: [
    {
      objectNameSingular: 'postCard',
      fieldName: 'content',
      canReadFieldValue: false,
      canUpdateFieldValue: false,
    },
  ],
  permissionFlags: [PermissionFlag.APPLICATIONS],
};
