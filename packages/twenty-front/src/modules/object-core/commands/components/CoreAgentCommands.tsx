import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { type CoreAgentCommand } from '@/object-core/commands/types/CoreAgentCommand';
import { type CoreAgentCommandId } from '@/object-core/commands/types/CoreAgentCommandId';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type CoreAgentCommandsProps = {
  commands: CoreAgentCommand[];
  section: CoreAgentCommand['section'];
  executeCommand: (id: CoreAgentCommandId) => void;
};

export const CoreAgentCommands = ({
  commands,
  section,
  executeCommand,
}: CoreAgentCommandsProps) =>
  commands
    .filter((command) => command.section === section)
    .map(({ id, label, Icon, disabled }) => (
      <SelectableListItem
        key={id}
        itemId={`core-agent-${id}`}
        onEnter={() => executeCommand(id)}
      >
        <CommandMenuItem
          id={`core-agent-${id}`}
          label={label}
          Icon={Icon}
          disabled={disabled}
          onClick={() => executeCommand(id)}
        />
      </SelectableListItem>
    ));
