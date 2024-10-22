import { actionMenuEntriesComponentSelector } from '@/action-menu/states/actionMenuEntriesComponentSelector';
import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const CommandMenuActions = ({
  mainContextStoreComponentInstanceId,
}: {
  mainContextStoreComponentInstanceId: string;
}) => {
  const actionMenuEntries = useRecoilComponentValueV2(
    actionMenuEntriesComponentSelector,
    mainContextStoreComponentInstanceId,
  );

  return (
    <CommandGroup heading="Actions">
      {actionMenuEntries?.map((actionMenuEntry) => (
        <SelectableItem
          itemId={actionMenuEntry.label}
          key={actionMenuEntry.label}
        >
          <CommandMenuItem
            id={actionMenuEntry.label}
            label={actionMenuEntry.label}
            Icon={actionMenuEntry.Icon}
            onClick={actionMenuEntry.onClick}
          />
        </SelectableItem>
      ))}
    </CommandGroup>
  );
};
