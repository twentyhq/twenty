import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuItemRenderer } from '@/command-menu-item/display/components/CommandMenuItemRenderer';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SIDE_PANEL_PREVIOUS_COMPONENT_INSTANCE_ID } from '@/side-panel/constants/SidePanelPreviousComponentInstanceId';
import { SIDE_PANEL_RESET_CONTEXT_TO_SELECTION } from '@/side-panel/constants/SidePanelResetContextToSelection';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { SidePanelResetContextToSelectionButton } from '@/side-panel/pages/root/components/SidePanelResetContextToSelectionButton';
import { useFilterCommandMenuItemsWithSidePanelSearch } from '@/side-panel/pages/root/hooks/useFilterCommandMenuItemsWithSidePanelSearch';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { useContext, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { CommandMenuItemAvailabilityType } from '~/generated-metadata/graphql';

export const SidePanelRootPage = () => {
  const { t } = useLingui();

  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);
  const { commandMenuItems, commandMenuContextApi } =
    useContext(CommandMenuContext);

  const { filterCommandMenuItemsWithSidePanelSearch } =
    useFilterCommandMenuItemsWithSidePanelSearch({
      sidePanelSearch,
      commandMenuContextApi,
    });

  const recordSelectionItems = useMemo(
    () =>
      commandMenuItems.filter(
        (item) =>
          item.availabilityType ===
          CommandMenuItemAvailabilityType.RECORD_SELECTION,
      ),
    [commandMenuItems],
  );

  const globalItems = useMemo(
    () =>
      commandMenuItems.filter(
        (item) =>
          item.availabilityType === CommandMenuItemAvailabilityType.GLOBAL,
      ),
    [commandMenuItems],
  );

  const fallbackItems = useMemo(
    () =>
      commandMenuItems.filter(
        (item) =>
          item.availabilityType === CommandMenuItemAvailabilityType.FALLBACK,
      ),
    [commandMenuItems],
  );

  const matchingRecordSelectionItems =
    filterCommandMenuItemsWithSidePanelSearch(recordSelectionItems);
  const matchingGlobalItems =
    filterCommandMenuItemsWithSidePanelSearch(globalItems);

  const noResults =
    !matchingRecordSelectionItems.length && !matchingGlobalItems.length;

  // oxlint-disable-next-line twenty/matching-state-variable
  const previousContextStoreCurrentObjectMetadataItemId =
    useAtomComponentStateValue(
      contextStoreCurrentObjectMetadataItemIdComponentState,
      SIDE_PANEL_PREVIOUS_COMPONENT_INSTANCE_ID,
    );

  const selectableItemIds = [
    ...matchingRecordSelectionItems,
    ...matchingGlobalItems,
    ...(noResults ? fallbackItems : []),
  ].map((item) => item.id);

  if (isDefined(previousContextStoreCurrentObjectMetadataItemId)) {
    selectableItemIds.unshift(SIDE_PANEL_RESET_CONTEXT_TO_SELECTION);
  }

  return (
    <SidePanelList selectableItemIds={selectableItemIds} noResults={noResults}>
      {isDefined(previousContextStoreCurrentObjectMetadataItemId) && (
        <SidePanelGroup heading={t`Context`}>
          <SidePanelResetContextToSelectionButton />
        </SidePanelGroup>
      )}
      {matchingRecordSelectionItems.length > 0 && (
        <SidePanelGroup heading={t`Record Selection`}>
          {matchingRecordSelectionItems.map((item) => (
            <CommandMenuItemRenderer item={item} key={item.id} />
          ))}
        </SidePanelGroup>
      )}
      {matchingGlobalItems.length > 0 && (
        <SidePanelGroup heading={t`Global`}>
          {matchingGlobalItems.map((item) => (
            <CommandMenuItemRenderer item={item} key={item.id} />
          ))}
        </SidePanelGroup>
      )}
      {noResults && fallbackItems.length > 0 && (
        <SidePanelGroup heading={t`Search ''${sidePanelSearch}'' with...`}>
          {fallbackItems.map((item) => (
            <CommandMenuItemRenderer item={item} key={item.id} />
          ))}
        </SidePanelGroup>
      )}
    </SidePanelList>
  );
};
