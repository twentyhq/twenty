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
      objectUniversalIdentifier: '9f9882af-170c-4879-b013-f9628b77c050',
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
  ],
  fieldPermissions: [
    {
      objectUniversalIdentifier: '9f9882af-170c-4879-b013-f9628b77c050',
      fieldUniversalIdentifier: 'b2c37dc0-8ae7-470e-96cd-1476b47dfaff',
      canReadFieldValue: false,
      canUpdateFieldValue: false,
    },
  ],
  permissionFlags: [PermissionFlag.APPLICATIONS],
};
