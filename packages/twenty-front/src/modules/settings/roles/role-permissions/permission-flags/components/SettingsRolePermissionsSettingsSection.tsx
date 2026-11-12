import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { SettingsRolePermissionsSettingsTableHeader } from '@/settings/roles/role-permissions/permission-flags/components/SettingsRolePermissionsSettingsTableHeader';
import { SettingsRolePermissionsSettingsTableRow } from '@/settings/roles/role-permissions/permission-flags/components/SettingsRolePermissionsSettingsTableRow';
import { useSettingsRolePermissionFlagConfig } from '@/settings/roles/role-permissions/permission-flags/hooks/useSettingsRolePermissionFlagConfig';
import { useRolePermissionFlagConfig } from '@/settings/roles/role-permissions/permission-flags/hooks/useRolePermissionFlagConfig';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { Section } from 'twenty-ui/components/layout';
import { IconSearch, IconSettings } from 'twenty-ui/icon';
import { Collapsible } from 'twenty-ui/primitives/layout';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';
import { useLingui } from '@lingui/react/macro';

const StyledTable = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledTableRows = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledSearchInputContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
  width: 100%;
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
  const { t } = useLingui();
  const [searchTerm, setSearchTerm] = useState('');
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

  const normalizedSearchTerm = searchTerm.trim().toLocaleLowerCase();
  const matchingSettingsPermissionsConfig = settingsPermissionsConfig.filter(
    (permission) =>
      permission.name.toLocaleLowerCase().includes(normalizedSearchTerm) ||
      permission.description.toLocaleLowerCase().includes(normalizedSearchTerm),
  );

  const shouldShowAllAccessToggle =
    !settingsDraftRole.canBeAssignedToAgents ||
    settingsDraftRole.canBeAssignedToUsers;

  return (
    <Section.Root>
      <Section.Header title={t`Layout`} description={t`Layout permissions`} />
      {shouldShowAllAccessToggle && (
        <StyledCardContainer>
          <Card.Root>
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
        <Collapsible.Panel dimension="height" containAnimation={false}>
          <StyledSearchInputContainer>
            <SettingsTextInput
              instanceId={`settings-role-permissions-search-${roleId}`}
              LeftIcon={IconSearch}
              placeholder={t`Search`}
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </StyledSearchInputContainer>
          <StyledTable>
            <SettingsRolePermissionsSettingsTableHeader
              roleId={roleId}
              settingsPermissionsConfig={settingsPermissionsConfig}
              isEditable={isEditable}
            />
            <StyledTableRows>
              {matchingSettingsPermissionsConfig.map((permission) => (
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
