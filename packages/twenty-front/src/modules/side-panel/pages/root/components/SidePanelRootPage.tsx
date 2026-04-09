import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SIDE_PANEL_PREVIOUS_COMPONENT_INSTANCE_ID } from '@/side-panel/constants/SidePanelPreviousComponentInstanceId';
import { SIDE_PANEL_RESET_CONTEXT_TO_SELECTION } from '@/side-panel/constants/SidePanelResetContextToSelection';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { type SidePanelCommandMenuItemGroupConfig } from '@/side-panel/types/SidePanelCommandMenuItemGroupConfig';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { SidePanelResetContextToSelectionButton } from '@/side-panel/pages/root/components/SidePanelResetContextToSelectionButton';
import { useSidePanelMatchingCommandMenuItems } from '@/side-panel/pages/root/hooks/useSidePanelMatchingCommandMenuItems';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

export const SidePanelRootPage = () => {
  const { t } = useLingui();

  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);
  const { objectMetadataItems } = useObjectMetadataItems();

  const {
    noResults,
    matchingRecordSelectionCommandMenuItems,
    matchingObjectCommandMenuItems,
    matchingWorkflowRunRecordSelectionCommandMenuItems,
    matchingFrontComponentRecordSelectionCommandMenuItems,
    matchingGlobalCommandMenuItems,
    matchingWorkflowRunGlobalCommandMenuItems,
    matchingFrontComponentGlobalCommandMenuItems,
    matchingNavigationCommandMenuItems,
    fallbackCommandMenuItems,
    matchingCreateRelatedRecordCommandMenuItems,
  } = useSidePanelMatchingCommandMenuItems({
    sidePanelSearch,
  });

  // oxlint-disable-next-line twenty/matching-state-variable
  const previousContextStoreCurrentObjectMetadataItemId =
    useAtomComponentStateValue(
      contextStoreCurrentObjectMetadataItemIdComponentState,
      SIDE_PANEL_PREVIOUS_COMPONENT_INSTANCE_ID,
    );

  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );
  const currentObjectMetadataItem = objectMetadataItems.find(
    (item) => item.id === contextStoreCurrentObjectMetadataItemId,
  );

  const commandGroups: SidePanelCommandMenuItemGroupConfig[] = [
    {
      heading: t`Record Selection`,
      items: matchingRecordSelectionCommandMenuItems
        .concat(matchingWorkflowRunRecordSelectionCommandMenuItems)
        .concat(matchingFrontComponentRecordSelectionCommandMenuItems),
    },
    {
      heading: t`Create Related Record`,
      items: matchingCreateRelatedRecordCommandMenuItems,
    },
    {
      heading: currentObjectMetadataItem?.labelPlural ?? t`Object`,
      items: matchingObjectCommandMenuItems,
    },
    {
      heading: t`Global`,
      items: matchingGlobalCommandMenuItems
        .concat(matchingWorkflowRunGlobalCommandMenuItems)
        .concat(matchingFrontComponentGlobalCommandMenuItems)
        .concat(matchingNavigationCommandMenuItems),
    },
    {
      heading: t`Search ''${sidePanelSearch}'' with...`,
      items: fallbackCommandMenuItems,
    },
  ];

  const selectableItems = commandGroups.flatMap((group) => group.items ?? []);

  const selectableItemIds = selectableItems.map((item) => item.key);

  if (isDefined(previousContextStoreCurrentObjectMetadataItemId)) {
    selectableItemIds.unshift(SIDE_PANEL_RESET_CONTEXT_TO_SELECTION);
  }

  return (
    <SidePanelList
      commandGroups={commandGroups}
      selectableItemIds={selectableItemIds}
      noResults={noResults}
    >
      {isDefined(previousContextStoreCurrentObjectMetadataItemId) && (
        <SidePanelGroup heading={t`Context`}>
          <SidePanelResetContextToSelectionButton />
        </SidePanelGroup>
      )}
    </SidePanelList>
  );
};
