import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { SettingsRolePermissionsSettingsTableHeader } from '@/settings/roles/role-permissions/settings-permissions/components/SettingsRolePermissionsSettingsTableHeader';
import { SettingsRolePermissionsSettingsTableRow } from '@/settings/roles/role-permissions/settings-permissions/components/SettingsRolePermissionsSettingsTableRow';
import { SettingsRolePermissionsSettingPermission } from '@/settings/roles/role-permissions/settings-permissions/types/SettingsRolePermissionsSettingPermission';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useRecoilState } from 'recoil';
import {
  H2Title,
  IconCode,
  IconHierarchy,
  IconKey,
  IconLockOpen,
  IconSettings,
  IconUsers,
} from 'twenty-ui/display';
import { Card, Section } from 'twenty-ui/layout';
import {
  FeatureFlagKey,
  SettingPermissionType,
} from '~/generated-metadata/graphql';

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
  const isPermissionsV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IsPermissionsV2Enabled,
  );

  const [settingsDraftRole, setSettingsDraftRole] = useRecoilState(
    settingsDraftRoleFamilyState(roleId),
  );

  const settingsPermissionsConfig: SettingsRolePermissionsSettingPermission[] =
    [
      {
        key: SettingPermissionType.API_KEYS_AND_WEBHOOKS,
        name: t`API Keys & Webhooks`,
        description: t`Manage API keys and webhooks`,
        Icon: IconCode,
      },
      {
        key: SettingPermissionType.WORKSPACE,
        name: t`Workspace`,
        description: t`Set global workspace preferences`,
        Icon: IconSettings,
      },
      {
        key: SettingPermissionType.WORKSPACE_MEMBERS,
        name: t`Users`,
        description: t`Add or remove users`,
        Icon: IconUsers,
      },
      {
        key: SettingPermissionType.ROLES,
        name: t`Roles`,
        description: t`Define user roles and access levels`,
        Icon: IconLockOpen,
      },
      {
        key: SettingPermissionType.DATA_MODEL,
        name: t`Data Model`,
        description: t`Edit CRM data structure and fields`,
        Icon: IconHierarchy,
      },
      {
        key: SettingPermissionType.SECURITY,
        name: t`Security`,
        description: t`Manage security policies`,
        Icon: IconKey,
      },
    ];

  return (
    <Section>
      <H2Title title={t`Settings`} description={t`Settings permissions`} />
      {isPermissionsV2Enabled && (
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
      <StyledTable>
        <SettingsRolePermissionsSettingsTableHeader />
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
    </Section>
  );
};
