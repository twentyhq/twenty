import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { t } from '@lingui/core/macro';

export const CRUD_PERMISSIONS: Array<{
  key: SettingsRoleObjectPermissionKey;
  label: (objectLabel: string) => string;
}> = [
  {
    key: 'canReadObjectRecords',
    label: (objectLabel: string) => t`See ${objectLabel}`,
  },
  {
    key: 'canUpdateObjectRecords',
    label: (objectLabel: string) => t`Edit ${objectLabel}`,
  },
  {
    key: 'canSoftDeleteObjectRecords',
    label: (objectLabel: string) => t`Delete ${objectLabel}`,
  },
  {
    key: 'canDestroyObjectRecords',
    label: (objectLabel: string) => t`Destroy ${objectLabel}`,
  },
];
