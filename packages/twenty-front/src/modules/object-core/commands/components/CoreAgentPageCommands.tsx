import { IconSettings, IconTerminal, IconTrash } from 'twenty-ui/icon';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CORE_AGENT_DELETE_DIALOG_ID } from '@/object-core/agents/constants/CoreAgentDeleteDialogId';
import { coreAgentIsRunsViewFamilyState } from '@/object-core/agents/states/coreAgentIsRunsViewFamilyState';
import { CORE_AGENT_DELETE_CURRENT_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentDeleteCurrentCommandId';
import { CORE_AGENT_TOGGLE_RUNS_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentToggleRunsCommandId';
import { useCoreAgentPageCommands } from '@/object-core/commands/hooks/useCoreAgentPageCommands';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

export const CoreAgentPageCommands = () => {
  const {
    currentCoreAgent,
    coreAgentIsRunsView,
    toggleRunsCommandLabel,
    shouldDisplayToggleRunsCommand,
    deleteCurrentCommandLabel,
    shouldDisplayDeleteCurrentCommand,
  } = useCoreAgentPageCommands();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { openDialog } = useDialog();
  const setCoreAgentIsRunsView = useSetAtomFamilyState(
    coreAgentIsRunsViewFamilyState,
    currentCoreAgent?.id ?? '',
  );

  const handleToggleRuns = () => {
    closeSidePanelMenu();
    setCoreAgentIsRunsView(!coreAgentIsRunsView);
  };

  const handleDelete = () => {
    closeSidePanelMenu();
    openDialog(CORE_AGENT_DELETE_DIALOG_ID);
  };

  return (
    <>
      {shouldDisplayToggleRunsCommand && (
        <SelectableListItem
          itemId={CORE_AGENT_TOGGLE_RUNS_COMMAND_ID}
          onEnter={handleToggleRuns}
        >
          <CommandMenuItem
            id={CORE_AGENT_TOGGLE_RUNS_COMMAND_ID}
            label={toggleRunsCommandLabel}
            Icon={coreAgentIsRunsView ? IconSettings : IconTerminal}
            onClick={handleToggleRuns}
          />
        </SelectableListItem>
      )}
      {shouldDisplayDeleteCurrentCommand && (
        <SelectableListItem
          itemId={CORE_AGENT_DELETE_CURRENT_COMMAND_ID}
          onEnter={handleDelete}
        >
          <CommandMenuItem
            id={CORE_AGENT_DELETE_CURRENT_COMMAND_ID}
            label={deleteCurrentCommandLabel}
            Icon={IconTrash}
            onClick={handleDelete}
          />
        </SelectableListItem>
      )}
    </>
  );
};
