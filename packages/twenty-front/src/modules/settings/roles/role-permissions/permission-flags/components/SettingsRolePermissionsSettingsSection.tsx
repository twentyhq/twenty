import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { SettingsRolePermissionsSettingsTableHeader } from '@/settings/roles/role-permissions/permission-flags/components/SettingsRolePermissionsSettingsTableHeader';
import { SettingsRolePermissionsSettingsTableRow } from '@/settings/roles/role-permissions/permission-flags/components/SettingsRolePermissionsSettingsTableRow';
import { useSettingsRolePermissionFlagConfig } from '@/settings/roles/role-permissions/permission-flags/hooks/useSettingsRolePermissionFlagConfig';
import { useRolePermissionFlagConfig } from '@/settings/roles/role-permissions/permission-flags/hooks/useRolePermissionFlagConfig';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Section } from 'twenty-ui/components/layout';
import { IconSettings } from 'twenty-ui/icon';
import { Collapsible } from 'twenty-ui/primitives/layout';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledTable = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledTableRows = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledCardContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

type SettingsRolePermissionsSettingsSectionProps = {
  roleId: string;
  isEditable: boolean;
};

export const SettingsRolePermissionsSettingsSection = ({
  roleId,
  isEditable,
}: SettingsRolePermissionsSettingsSectionProps) => {
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const standardSettingsPermissionsConfig = useSettingsRolePermissionFlagConfig(
    {
      assignmentCapabilities: {
        canBeAssignedToAgents: settingsDraftRole.canBeAssignedToAgents,
        canBeAssignedToUsers: settingsDraftRole.canBeAssignedToUsers,
        canBeAssignedToApiKeys: settingsDraftRole.canBeAssignedToApiKeys,
      },
    },
  );

  const settingsPermissionsConfig = useRolePermissionFlagConfig({
    permissionType: 'settings',
    standardPermissionsConfig: standardSettingsPermissionsConfig,
  });

  const shouldShowAllAccessToggle =
    !settingsDraftRole.canBeAssignedToAgents ||
    settingsDraftRole.canBeAssignedToUsers;

  return (
    <Section.Root>
      <Section.Header title={t`Layout`} description={t`Layout permissions`} />
      {shouldShowAllAccessToggle && (
        <StyledCardContainer>
          <Card.Root rounded>
            <SettingsOptionCardContentSwitch
              Icon={IconSettings}
              title={t`Layout All Access`}
              description={t`Full access to layout permissions`}
              checked={settingsDraftRole.canUpdateAllSettings}
              disabled={!isEditable}
              onChange={() => {
                setSettingsDraftRole({
                  ...settingsDraftRole,
                  canUpdateAllSettings: !settingsDraftRole.canUpdateAllSettings,
                });
              }}
            />
          </Card.Root>
        </StyledCardContainer>
      )}
      <Collapsible.Root
        open={
          !shouldShowAllAccessToggle || !settingsDraftRole.canUpdateAllSettings
        }
      >
        <Collapsible.Panel
          dimension="height"
          style={{ transitionDuration: '0.4s, 0.2s' }}
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
        </Collapsible.Panel>
      </Collapsible.Root>
    </Section.Root>
  );
};
