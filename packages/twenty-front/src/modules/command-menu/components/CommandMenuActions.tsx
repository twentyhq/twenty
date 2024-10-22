import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { contextStoreActionMenuEntriesComponentSelector } from '@/context-store/states/contextStoreActionMenuEntriesComponentSelector';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const CommandMenuActions = ({
  mainContextStoreComponentInstanceId,
}: {
  mainContextStoreComponentInstanceId: string;
}) => {
  console.log(
    'mainContextStoreComponentInstanceId',
    mainContextStoreComponentInstanceId,
  );
  const actionMenuEntries = useRecoilComponentValueV2(
    contextStoreActionMenuEntriesComponentSelector,
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
