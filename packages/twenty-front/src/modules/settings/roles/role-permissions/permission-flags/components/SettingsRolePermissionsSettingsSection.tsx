import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { SettingsRolePermissionsSettingsTableHeader } from '@/settings/roles/role-permissions/permission-flags/components/SettingsRolePermissionsSettingsTableHeader';
import { SettingsRolePermissionsSettingsTableRow } from '@/settings/roles/role-permissions/permission-flags/components/SettingsRolePermissionsSettingsTableRow';
import { type SettingsRolePermissionsSettingPermission } from '@/settings/roles/role-permissions/permission-flags/types/SettingsRolePermissionsSettingPermission';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useMemo } from 'react';
import { useRecoilState } from 'recoil';
import {
  H2Title,
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
import { AnimatedExpandableContainer, Card, Section } from 'twenty-ui/layout';
import { FeatureFlagKey, PermissionFlagType } from '~/generated/graphql';

const StyledTable = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledTableRows = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledCard = styled(Card)`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

type SettingsRolePermissionsSettingsSectionProps = {
  roleId: string;
  isEditable: boolean;
};

export const SettingsRolePermissionsSettingsSection = ({
  roleId,
  isEditable,
}: SettingsRolePermissionsSettingsSectionProps) => {
  const [settingsDraftRole, setSettingsDraftRole] = useRecoilState(
    settingsDraftRoleFamilyState(roleId),
  );

  const isAIEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);
  const isApplicationEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APPLICATION_ENABLED,
  );

  const settingsPermissionsConfig = useMemo(() => {
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

      // Filter based on role assignment capabilities
      const canBeAssignedOnlyToAgents =
        settingsDraftRole.canBeAssignedToAgents &&
        !settingsDraftRole.canBeAssignedToUsers &&
        !settingsDraftRole.canBeAssignedToApiKeys;

      const canBeAssignedOnlyToApiKeys =
        settingsDraftRole.canBeAssignedToApiKeys &&
        !settingsDraftRole.canBeAssignedToUsers &&
        !settingsDraftRole.canBeAssignedToAgents;

      const canBeAssignedOnlyToUsers =
        settingsDraftRole.canBeAssignedToUsers &&
        !settingsDraftRole.canBeAssignedToAgents &&
        !settingsDraftRole.canBeAssignedToApiKeys;

      if (canBeAssignedOnlyToAgents && !permission.isRelevantForAgents) {
        return false;
      }

      if (canBeAssignedOnlyToApiKeys && !permission.isRelevantForApiKeys) {
        return false;
      }

      if (canBeAssignedOnlyToUsers && !permission.isRelevantForUsers) {
        return false;
      }

      return true;
    });
  }, [isAIEnabled, isApplicationEnabled, settingsDraftRole]);

  const shouldShowAllAccessToggle =
    !settingsDraftRole.canBeAssignedToAgents ||
    settingsDraftRole.canBeAssignedToUsers;

  return (
    <Section>
      <H2Title title={t`Settings`} description={t`Settings permissions`} />
      {shouldShowAllAccessToggle && (
        <StyledCard rounded>
          <SettingsOptionCardContentToggle
            Icon={IconSettings}
            title={t`Settings All Access`}
            description={t`Ability to edit all settings`}
            checked={settingsDraftRole.canUpdateAllSettings}
            disabled={!isEditable}
            onChange={() => {
              setSettingsDraftRole({
                ...settingsDraftRole,
                canUpdateAllSettings: !settingsDraftRole.canUpdateAllSettings,
              });
            }}
          />
        </StyledCard>
      )}
      <AnimatedExpandableContainer
        isExpanded={
          !shouldShowAllAccessToggle || !settingsDraftRole.canUpdateAllSettings
        }
        dimension="height"
        animationDurations={{
          opacity: 0.2,
          size: 0.4,
        }}
        mode="scroll-height"
        containAnimation={false}
      >
        <StyledTable>
          <SettingsRolePermissionsSettingsTableHeader
            roleId={roleId}
            settingsPermissionsConfig={settingsPermissionsConfig}
            isEditable={isEditable}
          />
          <StyledTableRows>
            {settingsPermissionsConfig.map((permission) => (
              <SettingsRolePermissionsSettingsTableRow
                key={permission.key}
                roleId={roleId}
                permission={permission}
                isEditable={isEditable}
              />
            ))}
          </StyledTableRows>
        </StyledTable>
      </AnimatedExpandableContainer>
    </Section>
  );
};
