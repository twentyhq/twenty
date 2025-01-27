import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { ResetContextToSelectionCommandButton } from '@/command-menu/components/ResetContextToSelectionCommandButton';
import { useMatchingCommandMenuCommands } from '@/command-menu/hooks/useMatchingCommandMenuCommands';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { Command } from '@/command-menu/types/Command';
import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdComponentState';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

export type CommandGroupConfig = {
  heading: string;
  items?: Command[];
};

export const CommandMenu = () => {
  const { t } = useLingui();

  const commandMenuSearch = useRecoilValue(commandMenuSearchState);

  const {
    noResults,
    loading,
    copilotCommands,
    matchingStandardActionRecordSelectionCommands,
    matchingWorkflowRunRecordSelectionCommands,
    matchingStandardActionGlobalCommands,
    matchingWorkflowRunGlobalCommands,
    matchingNavigateCommand,
    peopleCommands,
    companyCommands,
    opportunityCommands,
    noteCommands,
    tasksCommands,
    customObjectCommands,
  } = useMatchingCommandMenuCommands({
    commandMenuSearch,
  });

  const selectableItems: Command[] = copilotCommands
    .concat(
      matchingStandardActionRecordSelectionCommands,
      matchingWorkflowRunRecordSelectionCommands,
      matchingStandardActionGlobalCommands,
      matchingWorkflowRunGlobalCommands,
      matchingNavigateCommand,
      peopleCommands,
      companyCommands,
      opportunityCommands,
      noteCommands,
      tasksCommands,
      customObjectCommands,
    )
    .filter(isDefined);

  const previousContextStoreCurrentObjectMetadataId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataIdComponentState,
    'command-menu-previous',
  );

  const selectableItemIds = selectableItems.map((item) => item.id);

  if (isNonEmptyString(previousContextStoreCurrentObjectMetadataId)) {
    selectableItemIds.unshift('reset-context-to-selection');
  }

  const commandGroups: CommandGroupConfig[] = [
    {
      heading: t`Copilot`,
      items: copilotCommands,
    },
    {
      heading: t`Record Selection`,
      items: matchingStandardActionRecordSelectionCommands,
    },
    {
      heading: t`Workflow Record Selection`,
      items: matchingWorkflowRunRecordSelectionCommands,
    },
    {
      heading: t`View`,
      items: matchingStandardActionGlobalCommands,
    },
    {
      heading: t`Workflows`,
      items: matchingWorkflowRunGlobalCommands,
    },
    {
      heading: t`Navigate`,
      items: matchingNavigateCommand,
    },
    {
      heading: t`People`,
      items: peopleCommands,
    },
    {
      heading: t`Companies`,
      items: companyCommands,
    },
    {
      heading: t`Opportunities`,
      items: opportunityCommands,
    },
    {
      heading: t`Notes`,
      items: noteCommands,
    },
    {
      heading: t`Tasks`,
      items: tasksCommands,
    },
    {
      heading: t`Custom Objects`,
      items: customObjectCommands,
    },
  ];

  return (
    <CommandMenuList
      commandGroups={commandGroups}
      selectableItemIds={selectableItemIds}
      loading={loading}
      noResults={noResults}
    >
      {isNonEmptyString(previousContextStoreCurrentObjectMetadataId) && (
        <CommandGroup heading={t`Context`} key={t`Context`}>
          <SelectableItem itemId="reset-context-to-selection">
            <ResetContextToSelectionCommandButton />
          </SelectableItem>
        </CommandGroup>
      )}
    </CommandMenuList>
  );
};
