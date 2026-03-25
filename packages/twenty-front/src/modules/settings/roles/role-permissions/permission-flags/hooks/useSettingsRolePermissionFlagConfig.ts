import { type SettingsRolePermissionsSettingPermission } from '@/settings/roles/role-permissions/permission-flags/types/SettingsRolePermissionsSettingPermission';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import {
  IconApps,
  IconCode,
  IconCreditCard,
  IconHierarchy,
  IconKey,
  IconLayoutSidebarRightCollapse,
  IconLockOpen,
  IconSettings,
  IconSettingsAutomation,
  IconShield,
  IconSparkles,
  IconSpy,
  IconUsers,
} from 'twenty-ui/display';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

type UseSettingsRolePermissionFlagConfigParams = {
  assignmentCapabilities?: {
    canBeAssignedToAgents?: boolean;
    canBeAssignedToUsers?: boolean;
    canBeAssignedToApiKeys?: boolean;
  };
};

export const useSettingsRolePermissionFlagConfig = ({
  assignmentCapabilities,
}: UseSettingsRolePermissionFlagConfigParams = {}): SettingsRolePermissionsSettingPermission[] => {
  const isAIEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);
  const isApplicationEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APPLICATION_ENABLED,
  );

  const {
    canBeAssignedToAgents = false,
    canBeAssignedToUsers = false,
    canBeAssignedToApiKeys = false,
  } = assignmentCapabilities ?? {};

  const hasAssignmentCapabilities = assignmentCapabilities !== undefined;

  return useMemo(() => {
    const allPermissions: SettingsRolePermissionsSettingPermission[] = [
      {
        key: PermissionFlagType.API_KEYS_AND_WEBHOOKS,
        name: t`API Keys & Webhooks`,
        description: t`Manage API keys and webhooks`,
        Icon: IconCode,
        isRelevantForAgents: true,
        isRelevantForApiKeys: true,
        isRelevantForUsers: true,
      },
      {
        key: PermissionFlagType.WORKSPACE,
        name: t`Workspace`,
        description: t`Set global workspace preferences`,
        Icon: IconSettings,
        isRelevantForAgents: true,
        isRelevantForApiKeys: true,
        isRelevantForUsers: true,
      },
      {
        key: PermissionFlagType.WORKSPACE_MEMBERS,
        name: t`Users`,
        description: t`Add or remove users`,
        Icon: IconUsers,
        isRelevantForAgents: true,
        isRelevantForApiKeys: true,
        isRelevantForUsers: true,
      },
      {
        key: PermissionFlagType.ROLES,
        name: t`Roles`,
        description: t`Define user roles and access levels`,
        Icon: IconLockOpen,
        isRelevantForAgents: true,
        isRelevantForApiKeys: true,
        isRelevantForUsers: true,
      },
      {
        key: PermissionFlagType.DATA_MODEL,
        name: t`Data Model`,
        description: t`Edit data structure and fields`,
        Icon: IconHierarchy,
        isRelevantForAgents: true,
        isRelevantForApiKeys: true,
        isRelevantForUsers: true,
      },
      {
        key: PermissionFlagType.SECURITY,
        name: t`Security`,
        description: t`Manage security policies`,
        Icon: IconKey,
        isRelevantForAgents: true,
        isRelevantForApiKeys: true,
        isRelevantForUsers: true,
      },
      {
        key: PermissionFlagType.WORKFLOWS,
        name: t`Workflows`,
        description: t`Manage workflows`,
        Icon: IconSettingsAutomation,
        isRelevantForAgents: true,
        isRelevantForApiKeys: true,
        isRelevantForUsers: true,
      },
      {
        key: PermissionFlagType.SSO_BYPASS,
        name: t`SSO Bypass`,
        description: t`Enable bypass options`,
        Icon: IconShield,
        isRelevantForAgents: false,
        isRelevantForApiKeys: false,
        isRelevantForUsers: true,
      },
      {
        key: PermissionFlagType.IMPERSONATE,
        name: t`Impersonate`,
        description: t`Impersonate workspace users`,
        Icon: IconSpy,
        isRelevantForAgents: false,
        isRelevantForApiKeys: false,
        isRelevantForUsers: true,
      },
      {
        key: PermissionFlagType.APPLICATIONS,
        name: t`Applications`,
        description: t`Install and manage applications`,
        Icon: IconApps,
        isRelevantForAgents: true,
        isRelevantForApiKeys: true,
        isRelevantForUsers: true,
      },
      {
        key: PermissionFlagType.LAYOUTS,
        name: t`Layouts`,
        description: t`Customize page layouts and UI structure`,
        Icon: IconLayoutSidebarRightCollapse,
        isRelevantForAgents: true,
        isRelevantForApiKeys: true,
        isRelevantForUsers: true,
      },
      {
        key: PermissionFlagType.BILLING,
        name: t`Billing`,
        description: t`Manage billing and subscriptions`,
        Icon: IconCreditCard,
        isRelevantForAgents: false,
        isRelevantForApiKeys: false,
        isRelevantForUsers: true,
      },
      {
        key: PermissionFlagType.AI_SETTINGS,
        name: t`AI`,
        description: t`Create and configure AI agents`,
        Icon: IconSparkles,
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
      if (permission.key === PermissionFlagType.AI_SETTINGS && !isAIEnabled) {
        return false;
      }
      if (
        permission.key === PermissionFlagType.APPLICATIONS &&
        !isApplicationEnabled
      ) {
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
    isApplicationEnabled,
  ]);
};
