import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { ResetContextToSelectionCommandButton } from '@/command-menu/components/ResetContextToSelectionCommandButton';
import { RESET_CONTEXT_TO_SELECTION } from '@/command-menu/constants/ResetContextToSelection';
import { useMatchingCommandMenuCommands } from '@/command-menu/hooks/useMatchingCommandMenuCommands';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { Command } from '@/command-menu/types/Command';
import { contextStoreCurrentObjectMetadataItemComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemComponentState';
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
    copilotCommands,
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

  const selectableItems: Command[] = copilotCommands
    .concat(
      matchingStandardActionRecordSelectionCommands,
      matchingStandardActionObjectCommands,
      matchingWorkflowRunRecordSelectionCommands,
      matchingStandardActionGlobalCommands,
      matchingWorkflowRunGlobalCommands,
      matchingNavigateCommands,
      fallbackCommands,
    )
    .filter(isDefined);

  const previousContextStoreCurrentObjectMetadataItem =
    useRecoilComponentValueV2(
      contextStoreCurrentObjectMetadataItemComponentState,
      'command-menu-previous',
    );

  const currentObjectMetadataItem = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataItemComponentState,
  );

  const selectableItemIds = selectableItems.map((item) => item.id);

  if (isDefined(previousContextStoreCurrentObjectMetadataItem)) {
    selectableItemIds.unshift(RESET_CONTEXT_TO_SELECTION);
  }

  const commandGroups: CommandGroupConfig[] = [
    {
      heading: t`Copilot`,
      items: copilotCommands,
    },
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
        .concat(matchingNavigateCommands)
        .concat(matchingWorkflowRunGlobalCommands),
    },
    {
      heading: t`Search ''${commandMenuSearch}'' with...`,
      items: fallbackCommands,
    },
  ];

  return (
    <CommandMenuList
      commandGroups={commandGroups}
      selectableItemIds={selectableItemIds}
      noResults={noResults}
    >
      {isDefined(previousContextStoreCurrentObjectMetadataItem) && (
        <CommandGroup heading={t`Context`}>
          <SelectableItem itemId={RESET_CONTEXT_TO_SELECTION}>
            <ResetContextToSelectionCommandButton />
          </SelectableItem>
        </CommandGroup>
      )}
    </CommandMenuList>
  );
};
