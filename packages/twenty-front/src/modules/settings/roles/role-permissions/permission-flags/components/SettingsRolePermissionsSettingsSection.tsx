import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { SettingsRolePermissionsSettingsTableHeader } from '@/settings/roles/role-permissions/permission-flags/components/SettingsRolePermissionsSettingsTableHeader';
import { SettingsRolePermissionsSettingsTableRow } from '@/settings/roles/role-permissions/permission-flags/components/SettingsRolePermissionsSettingsTableRow';
import { useSettingsRolePermissionFlagConfig } from '@/settings/roles/role-permissions/permission-flags/hooks/useSettingsRolePermissionFlagConfig';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useRecoilState } from 'recoil';
import { H2Title, IconSettings } from 'twenty-ui/display';
import { AnimatedExpandableContainer, Card, Section } from 'twenty-ui/layout';

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

  const settingsPermissionsConfig = useSettingsRolePermissionFlagConfig({
    assignmentCapabilities: {
      canBeAssignedToAgents: settingsDraftRole.canBeAssignedToAgents,
      canBeAssignedToUsers: settingsDraftRole.canBeAssignedToUsers,
      canBeAssignedToApiKeys: settingsDraftRole.canBeAssignedToApiKeys,
    },
  });

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
