import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { ResetContextToSelectionCommandButton } from '@/command-menu/components/ResetContextToSelectionCommandButton';
import { RESET_CONTEXT_TO_SELECTION } from '@/command-menu/constants/ResetContextToSelection';
import { useMatchingCommandMenuCommands } from '@/command-menu/hooks/useMatchingCommandMenuCommands';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { Command } from '@/command-menu/types/Command';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';

export type CommandGroupConfig = {
  heading: string;
  items?: Command[];
};

export const CommandMenu = () => {
  const { t } = useLingui();

  const commandMenuSearch = useRecoilValue(commandMenuSearchState);

  const {
    noResults,
    matchingStandardActionRecordSelectionCommands,
    matchingStandardActionObjectCommands,
    matchingWorkflowRunRecordSelectionCommands,
    matchingStandardActionGlobalCommands,
    matchingWorkflowRunGlobalCommands,
    matchingNavigateCommands,
    fallbackCommands,
  } = useMatchingCommandMenuCommands({
    commandMenuSearch,
  });

  const previousContextStoreCurrentObjectMetadataItemId =
    useRecoilComponentValueV2(
      contextStoreCurrentObjectMetadataItemIdComponentState,
      'command-menu-previous',
    );

  const { objectMetadataItem: currentObjectMetadataItem } =
    useContextStoreObjectMetadataItemOrThrow();

  const commandGroups: CommandGroupConfig[] = [
    {
      heading: t`Record Selection`,
      items: matchingStandardActionRecordSelectionCommands.concat(
        matchingWorkflowRunRecordSelectionCommands,
      ),
    },
    {
      heading: currentObjectMetadataItem?.labelPlural ?? t`Object`,
      items: matchingStandardActionObjectCommands,
    },
    {
      heading: t`Global`,
      items: matchingStandardActionGlobalCommands
        .concat(matchingWorkflowRunGlobalCommands)
        .concat(matchingNavigateCommands),
    },
    {
      heading: t`Search ''${commandMenuSearch}'' with...`,
      items: fallbackCommands,
    },
  ];

  const selectableItems: Command[] = commandGroups.flatMap(
    (group) => group.items ?? [],
  );

  const selectableItemIds = selectableItems.map((item) => item.id);

  if (isDefined(previousContextStoreCurrentObjectMetadataItemId)) {
    selectableItemIds.unshift(RESET_CONTEXT_TO_SELECTION);
  }

  return (
    <CommandMenuList
      commandGroups={commandGroups}
      selectableItemIds={selectableItemIds}
      noResults={noResults}
    >
      {isDefined(previousContextStoreCurrentObjectMetadataItemId) && (
        <CommandGroup heading={t`Context`}>
          <SelectableItem itemId={RESET_CONTEXT_TO_SELECTION}>
            <ResetContextToSelectionCommandButton />
          </SelectableItem>
        </CommandGroup>
      )}
    </CommandMenuList>
  );
};
