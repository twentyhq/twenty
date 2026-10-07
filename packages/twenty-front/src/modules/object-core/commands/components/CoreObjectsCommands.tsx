import { IconFilter } from 'twenty-ui/icon';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CORE_WORKFLOW_FILTERS_COMMAND_ID } from '@/object-core/commands/constants/CoreWorkflowFiltersCommandId';
import { useCoreObjectsCommands } from '@/object-core/commands/hooks/useCoreObjectsCommands';
import { useOpenCoreWorkflowFiltersSidePanel } from '@/object-core/workflows/hooks/useOpenCoreWorkflowFiltersSidePanel';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

export const CoreObjectsCommands = () => {
  const {
    coreWorkflowFiltersCommandLabel,
    shouldDisplayCoreWorkflowFiltersCommand,
  } = useCoreObjectsCommands();

  const { openCoreWorkflowFiltersSidePanel } =
    useOpenCoreWorkflowFiltersSidePanel();

  if (!shouldDisplayCoreWorkflowFiltersCommand) {
    return null;
  }

  return (
    <SelectableListItem
      itemId={CORE_WORKFLOW_FILTERS_COMMAND_ID}
      onEnter={openCoreWorkflowFiltersSidePanel}
    >
      <CommandMenuItem
        id={CORE_WORKFLOW_FILTERS_COMMAND_ID}
        label={coreWorkflowFiltersCommandLabel}
        Icon={IconFilter}
        onClick={openCoreWorkflowFiltersSidePanel}
      />
    </SelectableListItem>
  );
};
