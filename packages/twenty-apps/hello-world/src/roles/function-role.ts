import { defineRole, PermissionFlag } from 'twenty-sdk';

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
      objectUniversalIdentifier: '54b589ca-eeed-4950-a176-358418b85c05',
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
  ],
  fieldPermissions: [
    {
      objectUniversalIdentifier: '54b589ca-eeed-4950-a176-358418b85c05',
      fieldUniversalIdentifier: '58a0a314-d7ea-4865-9850-7fb84e72f30b',
      canReadFieldValue: false,
      canUpdateFieldValue: false,
    },
  ],
  permissionFlags: [PermissionFlag.APPLICATIONS],
});
