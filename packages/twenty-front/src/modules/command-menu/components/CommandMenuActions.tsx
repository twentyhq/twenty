import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { Command, CommandType } from '@/command-menu/types/Command';
import { contextStoreActionMenuEntriesComponentSelector } from '@/context-store/states/contextStoreActionMenuEntriesComponentSelector';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useEffect, useMemo } from 'react';

export const CommandMenuActions = ({
  mainContextStoreComponentInstanceId,
  matchingActionCommands,
  setActionCommands,
}: {
  mainContextStoreComponentInstanceId: string;
  matchingActionCommands: Command[];
  setActionCommands: (actionCommands: Command[]) => void;
}) => {
  const actionMenuEntries = useRecoilComponentValueV2(
    contextStoreActionMenuEntriesComponentSelector,
    mainContextStoreComponentInstanceId,
  );

  const actionCommands = useMemo(() => {
    return actionMenuEntries?.map((actionMenuEntry) => ({
      id: actionMenuEntry.label,
      label: actionMenuEntry.label,
      Icon: actionMenuEntry.Icon,
      onCommandClick: actionMenuEntry.onClick,
      type: CommandType.Action,
    }));
  }, [actionMenuEntries]);

  useEffect(() => {
    setActionCommands(actionCommands);
  }, [actionCommands, setActionCommands]);

  return (
    <CommandGroup heading="Actions">
      {matchingActionCommands?.map((actionCommand) => (
        <SelectableItem itemId={actionCommand.id} key={actionCommand.id}>
          <CommandMenuItem
            id={actionCommand.id}
            label={actionCommand.label}
            Icon={actionCommand.Icon}
            onClick={actionCommand.onCommandClick}
          />
        </SelectableItem>
      ))}
    </CommandGroup>
  );
};
