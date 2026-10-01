import { commandMenuItemsDraftState } from '@/command-menu-item/edit/states/commandMenuItemsDraftState';
import { useCurrentCommandMenuContextApi } from '@/command-menu-item/hooks/useCurrentCommandMenuContextApi';
import { doesCommandMenuItemMatchActiveNavigationTarget } from '@/command-menu-item/utils/doesCommandMenuItemMatchActiveNavigationTarget';
import { doesCommandMenuItemMatchObjectMetadataId } from '@/command-menu-item/utils/doesCommandMenuItemMatchObjectMetadataId';
import { doesCommandMenuItemMatchPageLayoutId } from '@/command-menu-item/utils/doesCommandMenuItemMatchPageLayoutId';
import { doesCommandMenuItemMatchPageType } from '@/command-menu-item/utils/doesCommandMenuItemMatchPageType';
import { doesCommandMenuItemMatchSelectionState } from '@/command-menu-item/utils/doesCommandMenuItemMatchSelectionState';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { currentPageLayoutIdState } from '@/page-layout/states/currentPageLayoutIdState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo } from 'react';
import { CommandMenuItemAvailabilityType } from '~/generated-metadata/graphql';

export const useEditableCommandMenuItems = () => {
  const commandMenuContextApi = useCurrentCommandMenuContextApi();
  const commandMenuItemsDraft = useAtomStateValue(commandMenuItemsDraftState);
  const currentPageLayoutId = useAtomStateValue(currentPageLayoutIdState);
  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  return useMemo(() => {
    const currentObjectMetadataItemId =
      commandMenuContextApi.objectMetadataItem.id;
    const hasSelectedRecords =
      commandMenuContextApi.numberOfSelectedRecords > 0;
    const activeObjectMetadataItemIds = new Set(
      activeObjectMetadataItems.map(({ id }) => id),
    );

    return (commandMenuItemsDraft ?? [])
      .filter(
        doesCommandMenuItemMatchObjectMetadataId(currentObjectMetadataItemId),
      )
      .filter(doesCommandMenuItemMatchPageType(commandMenuContextApi.pageType))
      .filter(doesCommandMenuItemMatchSelectionState(hasSelectedRecords))
      .filter(
        (item) =>
          item.availabilityType !== CommandMenuItemAvailabilityType.FALLBACK,
      )
      .filter(doesCommandMenuItemMatchPageLayoutId(currentPageLayoutId))
      .filter(
        doesCommandMenuItemMatchActiveNavigationTarget(
          activeObjectMetadataItemIds,
        ),
      )
      .sort(
        (firstItem, secondItem) => firstItem.position - secondItem.position,
      );
  }, [
    commandMenuItemsDraft,
    commandMenuContextApi,
    currentPageLayoutId,
    activeObjectMetadataItems,
  ]);
};
