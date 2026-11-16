import { IconFilter, IconPlus } from 'twenty-ui/icon';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { useCreateCoreAgent } from '@/object-core/agents/hooks/useCreateCoreAgent';
import { useOpenCoreAgentFiltersSidePanel } from '@/object-core/agents/hooks/useOpenCoreAgentFiltersSidePanel';
import { CORE_AGENTS_CREATE_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentsCreateCommandId';
import { CORE_AGENTS_FILTERS_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentsFiltersCommandId';
import { useCoreAgentsIndexCommands } from '@/object-core/commands/hooks/useCoreAgentsIndexCommands';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

export const CoreAgentsIndexCommands = () => {
  const {
    createCommandLabel,
    shouldDisplayCreateCommand,
    filtersCommandLabel,
    shouldDisplayFiltersCommand,
  } = useCoreAgentsIndexCommands();
  const { createCoreAgent } = useCreateCoreAgent();
  const { openCoreAgentFiltersSidePanel } = useOpenCoreAgentFiltersSidePanel();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const handleCreate = () => {
    closeSidePanelMenu();
    void createCoreAgent();
  };

  return (
    <>
      {shouldDisplayCreateCommand && (
        <SelectableListItem
          itemId={CORE_AGENTS_CREATE_COMMAND_ID}
          onEnter={handleCreate}
        >
          <CommandMenuItem
            id={CORE_AGENTS_CREATE_COMMAND_ID}
            label={createCommandLabel}
            Icon={IconPlus}
            onClick={handleCreate}
          />
        </SelectableListItem>
      )}
      {shouldDisplayFiltersCommand && (
        <SelectableListItem
          itemId={CORE_AGENTS_FILTERS_COMMAND_ID}
          onEnter={openCoreAgentFiltersSidePanel}
        >
          <CommandMenuItem
            id={CORE_AGENTS_FILTERS_COMMAND_ID}
            label={filtersCommandLabel}
            Icon={IconFilter}
            onClick={openCoreAgentFiltersSidePanel}
          />
        </SelectableListItem>
      )}
    </>
  );
};
