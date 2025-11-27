import { type SettingsRolePermissionsSettingPermission } from '@/settings/roles/role-permissions/permission-flags/types/SettingsRolePermissionsSettingPermission';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import {
  IconApi,
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

type UseActionRolePermissionFlagConfigParams = {
  assignmentCapabilities?: {
    canBeAssignedToAgents?: boolean;
    canBeAssignedToUsers?: boolean;
    canBeAssignedToApiKeys?: boolean;
  };
};

export const useActionRolePermissionFlagConfig = ({
  assignmentCapabilities,
}: UseActionRolePermissionFlagConfigParams = {}): SettingsRolePermissionsSettingPermission[] => {
  const isAIEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);

  const {
    canBeAssignedToAgents = false,
    canBeAssignedToUsers = false,
    canBeAssignedToApiKeys = false,
  } = assignmentCapabilities ?? {};

  const hasAssignmentCapabilities = assignmentCapabilities !== undefined;

  return useMemo(() => {
    const allPermissions: SettingsRolePermissionsSettingPermission[] = [
      {
        key: PermissionFlagType.AI,
        name: t`Ask AI`,
        description: t`Chat with AI agents and use AI features`,
        Icon: IconSparkles,
        isToolPermission: true,
        isRelevantForAgents: false,
        isRelevantForApiKeys: true,
        isRelevantForUsers: true,
      },
      {
        key: PermissionFlagType.UPLOAD_FILE,
        name: t`Upload Files`,
        description: t`Allow uploading files and attachments`,
        Icon: IconFileUpload,
        isToolPermission: true,
        isRelevantForAgents: false,
        isRelevantForApiKeys: true,
        isRelevantForUsers: true,
      },
      {
        key: PermissionFlagType.DOWNLOAD_FILE,
        name: t`Download Files`,
        description: t`Allow downloading files and attachments`,
        Icon: IconDownload,
        isToolPermission: true,
        isRelevantForAgents: false,
        isRelevantForApiKeys: true,
        isRelevantForUsers: true,
      },
      {
        key: PermissionFlagType.SEND_EMAIL_TOOL,
        name: t`Send Email`,
        description: t`Send emails via connected accounts`,
        Icon: IconMail,
        isToolPermission: true,
        isRelevantForAgents: true,
        isRelevantForApiKeys: true,
        isRelevantForUsers: true,
      },
      {
        key: PermissionFlagType.HTTP_REQUEST_TOOL,
        name: t`HTTP Request`,
        description: t`Make HTTP requests to external APIs`,
        Icon: IconApi,
        isToolPermission: true,
        isRelevantForAgents: true,
        isRelevantForApiKeys: false,
        isRelevantForUsers: false,
      },
      {
        key: PermissionFlagType.IMPORT_CSV,
        name: t`Import CSV`,
        description: t`Allow importing data from CSV files`,
        Icon: IconFileImport,
        isToolPermission: true,
        isRelevantForAgents: false,
        isRelevantForApiKeys: true,
        isRelevantForUsers: true,
      },
      {
        key: PermissionFlagType.EXPORT_CSV,
        name: t`Export CSV`,
        description: t`Allow exporting data to CSV files`,
        Icon: IconFileExport,
        isToolPermission: true,
        isRelevantForAgents: false,
        isRelevantForApiKeys: true,
        isRelevantForUsers: true,
      },
      {
        key: PermissionFlagType.CONNECTED_ACCOUNTS,
        name: t`Sync Account`,
        description: t`Sync email and calendar accounts`,
        Icon: IconAt,
        isToolPermission: true,
        isRelevantForAgents: false,
        isRelevantForApiKeys: false,
        isRelevantForUsers: true,
      },
      {
        key: PermissionFlagType.PROFILE_INFORMATION,
        name: t`Edit Profile`,
        description: t`Edit own profile information`,
        Icon: IconUser,
        isToolPermission: true,
        isRelevantForAgents: false,
        isRelevantForApiKeys: false,
        isRelevantForUsers: true,
      },
      {
        key: PermissionFlagType.VIEWS,
        name: t`Manage Views`,
        description: t`Create, edit, and delete workspace views`,
        Icon: IconTable,
        isToolPermission: true,
        isRelevantForAgents: true,
        isRelevantForApiKeys: true,
        isRelevantForUsers: true,
      },
    ];

    const canBeAssignedOnlyToAgents =
      canBeAssignedToAgents && !canBeAssignedToUsers && !canBeAssignedToApiKeys;

    const canBeAssignedOnlyToApiKeys =
      canBeAssignedToApiKeys && !canBeAssignedToUsers && !canBeAssignedToAgents;

    const canBeAssignedOnlyToUsers =
      canBeAssignedToUsers && !canBeAssignedToAgents && !canBeAssignedToApiKeys;

    return allPermissions.filter((permission) => {
      if (permission.key === PermissionFlagType.AI && !isAIEnabled) {
        return false;
      }

      if (hasAssignmentCapabilities) {
        if (canBeAssignedOnlyToAgents && !permission.isRelevantForAgents) {
          return false;
        }

        if (canBeAssignedOnlyToApiKeys && !permission.isRelevantForApiKeys) {
          return false;
        }

        if (canBeAssignedOnlyToUsers && !permission.isRelevantForUsers) {
          return false;
        }
      }

      return true;
    });
  }, [
    hasAssignmentCapabilities,
    canBeAssignedToAgents,
    canBeAssignedToUsers,
    canBeAssignedToApiKeys,
    isAIEnabled,
  ]);
};
