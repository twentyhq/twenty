import { ActionConfig } from '@/action-menu/actions/types/ActionConfig';
import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { ResetContextToSelectionCommandButton } from '@/command-menu/components/ResetContextToSelectionCommandButton';
import { RESET_CONTEXT_TO_SELECTION } from '@/command-menu/constants/ResetContextToSelection';
import { useMatchingCommandMenuActions } from '@/command-menu/hooks/useMatchingCommandMenuActions';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export type ActionGroupConfig = {
  heading: string;
  items?: ActionConfig[];
};

export const CommandMenu = () => {
  const { t } = useLingui();

  const commandMenuSearch = useRecoilValue(commandMenuSearchState);
  const { objectMetadataItems } = useObjectMetadataItems();

  const {
    noResults,
    matchingStandardActionRecordSelectionActions,
    matchingStandardActionObjectActions,
    matchingWorkflowRunRecordSelectionActions,
    matchingStandardActionGlobalActions,
    matchingWorkflowRunGlobalActions,
    matchingNavigateActions,
    fallbackActions,
    matchingCreateRelatedRecordActions,
  } = useMatchingCommandMenuActions({
    commandMenuSearch,
  });

  const previousContextStoreCurrentObjectMetadataItemId =
    useRecoilComponentValue(
      contextStoreCurrentObjectMetadataItemIdComponentState,
      'command-menu-previous',
    );

  const objectMetadataItemId = useRecoilComponentValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );
  const currentObjectMetadataItem = objectMetadataItems.find(
    (item) => item.id === objectMetadataItemId,
  );

  const commandGroups: ActionGroupConfig[] = [
    {
      heading: t`Record Selection`,
      items: matchingStandardActionRecordSelectionActions.concat(
        matchingWorkflowRunRecordSelectionActions,
      ),
    },
    {
      heading: t`Create Related Record`,
      items: matchingCreateRelatedRecordActions,
    },
    {
      heading: currentObjectMetadataItem?.labelPlural ?? t`Object`,
      items: matchingStandardActionObjectActions,
    },
    {
      heading: t`Global`,
      items: matchingStandardActionGlobalActions
        .concat(matchingWorkflowRunGlobalActions)
        .concat(matchingNavigateActions),
    },
    {
      heading: t`Search ''${commandMenuSearch}'' with...`,
      items: fallbackActions,
    },
  ];

  const selectableItems = commandGroups.flatMap((group) => group.items ?? []);

  const selectableItemIds = selectableItems.map((item) => item.key);

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
          <ResetContextToSelectionCommandButton />
        </CommandGroup>
      )}
    </CommandMenuList>
  );
};
