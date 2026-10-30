import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconTool } from 'twenty-ui/icon';

import { CommandMenuItemSectionGroup } from '@/command-menu-item/display/components/CommandMenuItemSectionGroup';
import { CommandMenuItemSwitch } from '@/command-menu/components/CommandMenuItemSwitch';
import { SidePanelCoreAgentReadOnlyBanner } from '@/object-core/agents/components/SidePanelCoreAgentReadOnlyBanner';
import { useCoreAgentSidePanelRole } from '@/object-core/agents/hooks/useCoreAgentSidePanelRole';
import { getCoreAgentEnabledToolFlags } from '@/object-core/agents/utils/getCoreAgentEnabledToolFlags';
import { getRoleWithCoreAgentToolFlags } from '@/object-core/agents/utils/getRoleWithCoreAgentToolFlags';
import { useActionRolePermissionFlagConfig } from '@/settings/roles/role-permissions/permission-flags/hooks/useActionRolePermissionFlagConfig';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

export const SidePanelCoreAgentToolsPage = () => {
  const { t } = useLingui();
  const { agent, role, updateRole, isAgentReadOnly, isReadOnly } =
    useCoreAgentSidePanelRole();
  const toolPermissions = useActionRolePermissionFlagConfig({
    assignmentCapabilities: { canBeAssignedToAgents: true },
  });

  const enabledToolFlags = getCoreAgentEnabledToolFlags(role);

  const toggleToolFlag = ({
    toolFlag,
    isEnabled,
  }: {
    toolFlag: string;
    isEnabled: boolean;
  }) =>
    updateRole((currentRole) => {
      const currentToolFlags = getCoreAgentEnabledToolFlags(currentRole);

      return getRoleWithCoreAgentToolFlags({
        role: currentRole,
        enabledToolFlags: isEnabled
          ? [...currentToolFlags, toolFlag]
          : currentToolFlags.filter(
              (currentToolFlag) => currentToolFlag !== toolFlag,
            ),
      });
    });

  const readOnlyMessage = isAgentReadOnly
    ? t`This agent comes from an app, so its tools can't be changed here.`
    : t`This agent shares its role with other members or agents. Change its tools in Settings > Roles.`;

  return (
    <SidePanelList selectableItemIds={toolPermissions.map(({ key }) => key)}>
      {isDefined(agent) && isReadOnly && (
        <SidePanelCoreAgentReadOnlyBanner message={readOnlyMessage} />
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
                  toggleToolFlag({
                    toolFlag: toolPermission.key,
                    isEnabled: !isEnabled,
                  });
                }
              }}
            >
              <CommandMenuItemSwitch
                id={toolPermission.key}
                LeftIcon={toolPermission.Icon}
                text={toolPermission.name}
                checked={isEnabled}
                onCheckedChange={(isChecked) =>
                  toggleToolFlag({
                    toolFlag: toolPermission.key,
                    isEnabled: isChecked,
                  })
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
