import { SettingsOptionCardContentSwitch } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSwitch';
import { SettingsRolePermissionsSettingsTableHeader } from '@/settings/roles/role-permissions/permission-flags/components/SettingsRolePermissionsSettingsTableHeader';
import { SettingsRolePermissionsSettingsTableRow } from '@/settings/roles/role-permissions/permission-flags/components/SettingsRolePermissionsSettingsTableRow';
import { useActionRolePermissionFlagConfig } from '@/settings/roles/role-permissions/permission-flags/hooks/useActionRolePermissionFlagConfig';
import { useRolePermissionFlagConfig } from '@/settings/roles/role-permissions/permission-flags/hooks/useRolePermissionFlagConfig';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';

import { Section } from 'twenty-ui/components';
import { IconTool } from 'twenty-ui/icon';
import { AnimatedExpandableContainer } from 'twenty-ui/primitives/layout';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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

type SettingsRolePermissionsToolSectionProps = {
  roleId: string;
  isEditable: boolean;
};

export const SettingsRolePermissionsToolSection = ({
  roleId,
  isEditable,
}: SettingsRolePermissionsToolSectionProps) => {
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const standardToolPermissionsConfig = useActionRolePermissionFlagConfig({
    assignmentCapabilities: {
      canBeAssignedToAgents: settingsDraftRole.canBeAssignedToAgents,
      canBeAssignedToUsers: settingsDraftRole.canBeAssignedToUsers,
      canBeAssignedToApiKeys: settingsDraftRole.canBeAssignedToApiKeys,
    },
  });

  const { permissions: toolPermissionsConfig, isReady } =
    useRolePermissionFlagConfig({
      permissionType: 'tool',
      standardPermissionsConfig: standardToolPermissionsConfig,
    });

  const shouldShowAllAccessToggle =
    !settingsDraftRole.canBeAssignedToAgents ||
    settingsDraftRole.canBeAssignedToUsers;

  return (
    <Section.Root>
      <Section.Header title={t`Logic`} description={t`Logic permissions`} />
      {shouldShowAllAccessToggle && (
        <StyledCardContainer>
          <Card rounded>
            <SettingsOptionCardContentSwitch
              Icon={IconTool}
              title={t`Logic All Access`}
              description={t`Full access to logic permissions`}
              checked={settingsDraftRole.canAccessAllTools}
              disabled={!isEditable}
              onChange={() => {
                setSettingsDraftRole({
                  ...settingsDraftRole,
                  canAccessAllTools: !settingsDraftRole.canAccessAllTools,
                });
              }}
            />
          </Card>
        </StyledCardContainer>
      )}
      <AnimatedExpandableContainer
        isExpanded={
          !shouldShowAllAccessToggle || !settingsDraftRole.canAccessAllTools
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
            settingsPermissionsConfig={toolPermissionsConfig}
            isEditable={isEditable && isReady}
          />
          <StyledTableRows>
            {toolPermissionsConfig.map((permission) => (
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
    </Section.Root>
  );
};
