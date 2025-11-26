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

export const useSettingsRolePermissionFlagConfig =
  (): SettingsRolePermissionsSettingPermission[] => {
    const isAIEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);
    const isApplicationEnabled = useIsFeatureEnabled(
      FeatureFlagKey.IS_APPLICATION_ENABLED,
    );

    return useMemo(
      () =>
        [
          {
            key: PermissionFlagType.API_KEYS_AND_WEBHOOKS,
            name: t`API Keys & Webhooks`,
            description: t`Manage API keys and webhooks`,
            Icon: IconCode,
          },
          {
            key: PermissionFlagType.WORKSPACE,
            name: t`Workspace`,
            description: t`Set global workspace preferences`,
            Icon: IconSettings,
          },
          {
            key: PermissionFlagType.WORKSPACE_MEMBERS,
            name: t`Users`,
            description: t`Add or remove users`,
            Icon: IconUsers,
          },
          {
            key: PermissionFlagType.ROLES,
            name: t`Roles`,
            description: t`Define user roles and access levels`,
            Icon: IconLockOpen,
          },
          {
            key: PermissionFlagType.DATA_MODEL,
            name: t`Data Model`,
            description: t`Edit data structure and fields`,
            Icon: IconHierarchy,
          },
          {
            key: PermissionFlagType.SECURITY,
            name: t`Security`,
            description: t`Manage security policies`,
            Icon: IconKey,
          },
          {
            key: PermissionFlagType.WORKFLOWS,
            name: t`Workflows`,
            description: t`Manage workflows`,
            Icon: IconSettingsAutomation,
          },
          {
            key: PermissionFlagType.SSO_BYPASS,
            name: t`SSO Bypass`,
            description: t`Enable bypass options`,
            Icon: IconShield,
          },
          {
            key: PermissionFlagType.IMPERSONATE,
            name: t`Impersonate`,
            description: t`Impersonate workspace users`,
            Icon: IconSpy,
          },
          {
            key: PermissionFlagType.APPLICATIONS,
            name: t`Applications`,
            description: t`Install and manage applications`,
            Icon: IconApps,
          },
          {
            key: PermissionFlagType.LAYOUTS,
            name: t`Layouts`,
            description: t`Customize page layouts and UI structure`,
            Icon: IconLayoutSidebarRightCollapse,
          },
          {
            key: PermissionFlagType.BILLING,
            name: t`Billing`,
            description: t`Manage billing and subscriptions`,
            Icon: IconCreditCard,
          },
          {
            key: PermissionFlagType.AI_SETTINGS,
            name: t`AI`,
            description: t`Create and configure AI agents`,
            Icon: IconSparkles,
          },
        ].filter((permission) => {
          if (
            permission.key === PermissionFlagType.AI_SETTINGS &&
            !isAIEnabled
          ) {
            return false;
          }
          if (
            permission.key === PermissionFlagType.APPLICATIONS &&
            !isApplicationEnabled
          ) {
            return false;
          }
          return true;
        }),
      [isAIEnabled, isApplicationEnabled],
    );
  };
