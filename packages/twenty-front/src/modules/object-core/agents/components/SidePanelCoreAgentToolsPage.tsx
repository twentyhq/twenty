import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconTool } from 'twenty-ui/icon';

import { CommandMenuItemSectionGroup } from '@/command-menu-item/display/components/CommandMenuItemSectionGroup';
import { CommandMenuItemSwitch } from '@/command-menu/components/CommandMenuItemSwitch';
import { SidePanelCoreAgentReadOnlyBanner } from '@/object-core/agents/components/SidePanelCoreAgentReadOnlyBanner';
import { SidePanelCoreAgentSearchInput } from '@/object-core/agents/components/SidePanelCoreAgentSearchInput';
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
  const [search, setSearch] = useState('');

  const searchTerm = search.trim().toLowerCase();
  const matchingToolPermissions = toolPermissions.filter(({ name }) =>
    name.toLowerCase().includes(searchTerm),
  );

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
    <>
      <SidePanelCoreAgentSearchInput
        value={search}
        placeholder={t`Search tools`}
        onChange={setSearch}
      />
      <SidePanelList
        selectableItemIds={matchingToolPermissions.map(({ key }) => key)}
        noResults={matchingToolPermissions.length === 0}
        noResultsText={t`No tools match your search`}
      >
        {isDefined(agent) && isReadOnly && (
          <SidePanelCoreAgentReadOnlyBanner message={readOnlyMessage} />
        )}
        {matchingToolPermissions.length > 0 && (
          <CommandMenuItemSectionGroup heading={t`Tools`} Icon={IconTool}>
            {matchingToolPermissions.map((toolPermission) => {
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
        )}
      </SidePanelList>
    </>
  );
};
