import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconTool } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { CommandMenuItemSectionGroup } from '@/command-menu-item/display/components/CommandMenuItemSectionGroup';
import { CommandMenuItemSwitch } from '@/command-menu/components/CommandMenuItemSwitch';
import { useCoreAgentRole } from '@/object-core/agents/hooks/useCoreAgentRole';
import { useCoreAgentSidePanelAgent } from '@/object-core/agents/hooks/useCoreAgentSidePanelAgent';
import { useIsCoreAgentReadOnly } from '@/object-core/agents/hooks/useIsCoreAgentReadOnly';
import { getCoreAgentEnabledToolFlags } from '@/object-core/agents/utils/getCoreAgentEnabledToolFlags';
import { getRoleWithCoreAgentToolFlags } from '@/object-core/agents/utils/getRoleWithCoreAgentToolFlags';
import { useActionRolePermissionFlagConfig } from '@/settings/roles/role-permissions/permission-flags/hooks/useActionRolePermissionFlagConfig';
import { SidePanelInformationBanner } from '@/side-panel/components/SidePanelInformationBanner/SidePanelInformationBanner';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

const StyledBannerContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

export const SidePanelCoreAgentToolsPage = () => {
  const { t } = useLingui();
  const { agent } = useCoreAgentSidePanelAgent();

  const { role, updateRole, canEditRole } = useCoreAgentRole({
    id: agent?.id ?? '',
    roleId: agent?.roleId,
  });
  const isAgentReadOnly = useIsCoreAgentReadOnly({
    applicationId: agent?.applicationId,
  });
  const toolPermissions = useActionRolePermissionFlagConfig({
    assignmentCapabilities: { canBeAssignedToAgents: true },
  });

  const enabledToolFlags = getCoreAgentEnabledToolFlags(role);
  const isReadOnly =
    !isDefined(agent) || !isDefined(role) || isAgentReadOnly || !canEditRole;

  const toggleToolFlag = (toolFlag: string, isEnabled: boolean) =>
    updateRole((currentRole) => {
      const currentToolFlags = getCoreAgentEnabledToolFlags(currentRole);

      return getRoleWithCoreAgentToolFlags(
        currentRole,
        isEnabled
          ? [...currentToolFlags, toolFlag]
          : currentToolFlags.filter(
              (currentToolFlag) => currentToolFlag !== toolFlag,
            ),
      );
    });

  const readOnlyMessage = isAgentReadOnly
    ? t`This agent comes from an app, so its tools can't be changed here.`
    : t`This agent shares its role with other members or agents. Change its tools in Settings > Roles.`;

  return (
    <SidePanelList selectableItemIds={toolPermissions.map(({ key }) => key)}>
      {isDefined(agent) && isReadOnly && (
        <StyledBannerContainer>
          <SidePanelInformationBanner message={readOnlyMessage} />
        </StyledBannerContainer>
      )}
      <CommandMenuItemSectionGroup heading={t`Tools`} Icon={IconTool}>
        {toolPermissions.map((toolPermission) => {
          const isEnabled = enabledToolFlags.includes(toolPermission.key);

          return (
            <SelectableListItem
              key={toolPermission.key}
              itemId={toolPermission.key}
              onEnter={() => {
                if (!isReadOnly) {
                  toggleToolFlag(toolPermission.key, !isEnabled);
                }
              }}
            >
              <CommandMenuItemSwitch
                id={toolPermission.key}
                LeftIcon={toolPermission.Icon}
                text={toolPermission.name}
                checked={isEnabled}
                onCheckedChange={(isChecked) =>
                  toggleToolFlag(toolPermission.key, isChecked)
                }
                disabled={isReadOnly}
              />
            </SelectableListItem>
          );
        })}
      </CommandMenuItemSectionGroup>
    </SidePanelList>
  );
};
