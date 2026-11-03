import { IconCancel, IconDeviceFloppy } from 'twenty-ui/icon';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { useSaveCoreAgent } from '@/object-core/agents/hooks/useSaveCoreAgent';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import { CORE_AGENT_CANCEL_EDITION_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentCancelEditionCommandId';
import { CORE_AGENT_SAVE_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentSaveCommandId';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type CoreAgentEditionCommandsProps = {
  agent: CoreAgent;
  saveCommandLabel: string;
  shouldDisplaySaveCommand: boolean;
  cancelEditionCommandLabel: string;
  shouldDisplayCancelEditionCommand: boolean;
};

export const CoreAgentEditionCommands = ({
  agent,
  saveCommandLabel,
  shouldDisplaySaveCommand,
  cancelEditionCommandLabel,
  shouldDisplayCancelEditionCommand,
}: CoreAgentEditionCommandsProps) => {
  const { saveCoreAgent, discardCoreAgentChanges } = useSaveCoreAgent(agent);
  const { closeSidePanelMenu } = useSidePanelMenu();

  const handleSave = () => {
    closeSidePanelMenu();
    void saveCoreAgent();
  };

  const handleCancelEdition = () => {
    closeSidePanelMenu();
    discardCoreAgentChanges();
  };

  return (
    <>
      {shouldDisplaySaveCommand && (
        <SelectableListItem
          itemId={CORE_AGENT_SAVE_COMMAND_ID}
          onEnter={handleSave}
        >
          <CommandMenuItem
            id={CORE_AGENT_SAVE_COMMAND_ID}
            label={saveCommandLabel}
            Icon={IconDeviceFloppy}
            onClick={handleSave}
          />
        </SelectableListItem>
      )}
      {shouldDisplayCancelEditionCommand && (
        <SelectableListItem
          itemId={CORE_AGENT_CANCEL_EDITION_COMMAND_ID}
          onEnter={handleCancelEdition}
        >
          <CommandMenuItem
            id={CORE_AGENT_CANCEL_EDITION_COMMAND_ID}
            label={cancelEditionCommandLabel}
            Icon={IconCancel}
            onClick={handleCancelEdition}
          />
        </SelectableListItem>
      )}
    </>
  );
};
