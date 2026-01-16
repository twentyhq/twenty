import { defineRole, PermissionFlag } from 'twenty-sdk';

export const DEFAULT_FUNCTION_ROLE_UNIVERSAL_IDENTIFIER =
  '846e1b0c-68e7-4017-80bc-be034e476ea9';

export default defineRole({
  universalIdentifier: DEFAULT_FUNCTION_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'invoicer roler',
  description: 'Default role for invoicer function',
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
      objectNameSingular: 'company',
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    {
      objectNameSingular: 'project',
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    {
      objectNameSingular: 'prestation',
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
    {
      objectNameSingular: 'invoice',
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: true,
      canDestroyObjectRecords: true,
    },
    {
      objectNameSingular: 'invoiceTemplate',
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: true,
      canDestroyObjectRecords: true,
    },
    {
      objectNameSingular: 'projectPrestation',
      canReadObjectRecords: true,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    },
  ],
  permissionFlags: [PermissionFlag.APPLICATIONS, PermissionFlag.UPLOAD_FILE],
});
