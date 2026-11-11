import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { t } from '@lingui/core/macro';

export const getObjectPermissionActionLabel = (
  objectPermissionKey: SettingsRoleObjectPermissionKey,
) => {
  switch (objectPermissionKey) {
    case 'canReadObjectRecords':
      return t`See`;
    case 'canUpdateObjectRecords':
      return t`Edit`;
    case 'canSoftDeleteObjectRecords':
      return t`Delete`;
    case 'canDestroyObjectRecords':
      return t`Destroy`;
  }
};
