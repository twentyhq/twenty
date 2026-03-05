import { type ActionConfig } from '@/action-menu/actions/types/ActionConfig';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { ResetContextToSelectionCommandButton } from '@/command-menu/components/ResetContextToSelectionCommandButton';
import { RESET_CONTEXT_TO_SELECTION } from '@/command-menu/constants/ResetContextToSelection';
import { useMatchingCommandMenuActions } from '@/command-menu/hooks/useMatchingCommandMenuActions';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

export type ActionGroupConfig = {
  heading: string;
  items?: ActionConfig[];
};

export const CommandMenu = () => {
  const { t } = useLingui();

  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);
  const { objectMetadataItems } = useObjectMetadataItems();

  const {
    noResults,
    matchingStandardActionRecordSelectionActions,
    matchingStandardActionObjectActions,
    matchingWorkflowRunRecordSelectionActions,
    matchingFrontComponentRecordSelectionActions,
    matchingStandardActionGlobalActions,
    matchingWorkflowRunGlobalActions,
    matchingFrontComponentGlobalActions,
    matchingNavigateActions,
    fallbackActions,
    matchingCreateRelatedRecordActions,
  } = useMatchingCommandMenuActions({
    commandMenuSearch: sidePanelSearch,
  });

  // eslint-disable-next-line twenty/matching-state-variable
  const previousContextStoreCurrentObjectMetadataItemId =
    useAtomComponentStateValue(
      contextStoreCurrentObjectMetadataItemIdComponentState,
      'command-menu-previous',
    );

  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );
  const currentObjectMetadataItem = objectMetadataItems.find(
    (item) => item.id === contextStoreCurrentObjectMetadataItemId,
  );

  const commandGroups: ActionGroupConfig[] = [
    {
      heading: t`Record Selection`,
      items: matchingStandardActionRecordSelectionActions
        .concat(matchingWorkflowRunRecordSelectionActions)
        .concat(matchingFrontComponentRecordSelectionActions),
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
        .concat(matchingFrontComponentGlobalActions)
        .concat(matchingNavigateActions),
    },
    {
      heading: t`Search ''${sidePanelSearch}'' with...`,
      items: fallbackActions,
    },
  ];

  const selectableItems = commandGroups.flatMap((group) => group.items ?? []);

  const selectableItemIds = selectableItems.map((item) => item.key);

  if (isDefined(previousContextStoreCurrentObjectMetadataItemId)) {
    selectableItemIds.unshift(RESET_CONTEXT_TO_SELECTION);
  }

  return (
    <SidePanelList
      commandGroups={commandGroups}
      selectableItemIds={selectableItemIds}
      noResults={noResults}
    >
      {isDefined(previousContextStoreCurrentObjectMetadataItemId) && (
        <SidePanelGroup heading={t`Context`}>
          <ResetContextToSelectionCommandButton />
        </SidePanelGroup>
      )}
    </SidePanelList>
  );
};
