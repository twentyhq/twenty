import { type SettingsRoleObjectPermissionKey } from '@/settings/roles/role-permissions/object-overrides/constants/SettingsRoleObjectPermissionIconConfig';
import { t } from '@lingui/core/macro';

export const getObjectDisabledOperationReason = ({
  operation,
  applicationName,
}: {
  operation: SettingsRoleObjectPermissionKey;
  applicationName: string;
}) => {
  switch (operation) {
    case 'canReadObjectRecords':
      return t`Only ${applicationName} can see`;
    case 'canUpdateObjectRecords':
      return t`Only ${applicationName} can edit`;
    case 'canSoftDeleteObjectRecords':
      return t`Only ${applicationName} can delete`;
    case 'canDestroyObjectRecords':
      return t`Only ${applicationName} can destroy`;
  }
};
