import { type SettingsRolePermissionsSettingPermission } from '@/settings/roles/role-permissions/permission-flags/types/SettingsRolePermissionsSettingPermission';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import {
  IconAt,
  IconDownload,
  IconFileExport,
  IconFileImport,
  IconFileUpload,
  IconMail,
  IconSparkles,
  IconTable,
  IconUser,
} from 'twenty-ui/display';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

export const useActionRolePermissionFlagConfig =
  (): SettingsRolePermissionsSettingPermission[] => {
    const isAIEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);

    return useMemo(
      () =>
        [
          {
            key: PermissionFlagType.AI,
            name: t`Ask AI`,
            description: t`Chat with AI agents and use AI features`,
            Icon: IconSparkles,
            isToolPermission: true,
          },
          {
            key: PermissionFlagType.UPLOAD_FILE,
            name: t`Upload Files`,
            description: t`Allow uploading files and attachments`,
            Icon: IconFileUpload,
            isToolPermission: true,
          },
          {
            key: PermissionFlagType.DOWNLOAD_FILE,
            name: t`Download Files`,
            description: t`Allow downloading files and attachments`,
            Icon: IconDownload,
            isToolPermission: true,
          },
          {
            key: PermissionFlagType.SEND_EMAIL_TOOL,
            name: t`Send Email`,
            description: t`Send emails via connected accounts`,
            Icon: IconMail,
            isToolPermission: true,
          },
          {
            key: PermissionFlagType.IMPORT_CSV,
            name: t`Import CSV`,
            description: t`Allow importing data from CSV files`,
            Icon: IconFileImport,
            isToolPermission: true,
          },
          {
            key: PermissionFlagType.EXPORT_CSV,
            name: t`Export CSV`,
            description: t`Allow exporting data to CSV files`,
            Icon: IconFileExport,
            isToolPermission: true,
          },
          {
            key: PermissionFlagType.CONNECTED_ACCOUNTS,
            name: t`Sync Account`,
            description: t`Sync email and calendar accounts`,
            Icon: IconAt,
            isToolPermission: true,
          },
          {
            key: PermissionFlagType.PROFILE_INFORMATION,
            name: t`Edit Profile`,
            description: t`Edit own profile information`,
            Icon: IconUser,
            isToolPermission: true,
          },
          {
            key: PermissionFlagType.VIEWS,
            name: t`Manage Views`,
            description: t`Create, edit, and delete workspace views`,
            Icon: IconTable,
            isToolPermission: true,
          },
        ].filter((permission) => {
          if (permission.key === PermissionFlagType.AI && !isAIEnabled) {
            return false;
          }
          return true;
        }),
      [isAIEnabled],
    );
  };
