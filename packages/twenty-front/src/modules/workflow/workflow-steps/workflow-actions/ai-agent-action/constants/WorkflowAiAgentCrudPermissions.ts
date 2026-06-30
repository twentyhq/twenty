import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';

export const CRUD_PERMISSIONS: Array<{
  key: SettingsRoleObjectPermissionKey;
  label: (objectLabel: string) => string;
}> = [
  {
    key: 'canReadObjectRecords',
    label: (objectLabel: string) => `See ${objectLabel}`,
  },
  {
    key: 'canUpdateObjectRecords',
    label: (objectLabel: string) => `Edit ${objectLabel}`,
  },
  {
    key: 'canSoftDeleteObjectRecords',
    label: (objectLabel: string) => `Delete ${objectLabel}`,
  },
  {
    key: 'canDestroyObjectRecords',
    label: (objectLabel: string) => `Destroy ${objectLabel}`,
  },
];
