import { commandMenuItemsDraftState } from '@/command-menu-item/edit/states/commandMenuItemsDraftState';
import { useCurrentCommandMenuContextApi } from '@/command-menu-item/hooks/useCurrentCommandMenuContextApi';
import { doesCommandMenuItemMatchObjectMetadataId } from '@/command-menu-item/utils/doesCommandMenuItemMatchObjectMetadataId';
import { doesCommandMenuItemMatchPageLayoutId } from '@/command-menu-item/utils/doesCommandMenuItemMatchPageLayoutId';
import { doesCommandMenuItemMatchPageType } from '@/command-menu-item/utils/doesCommandMenuItemMatchPageType';
import { doesCommandMenuItemMatchSelectionState } from '@/command-menu-item/utils/doesCommandMenuItemMatchSelectionState';
import { mainContextStoreHasSelectedRecordsSelector } from '@/context-store/states/selectors/mainContextStoreHasSelectedRecordsSelector';
import { currentPageLayoutIdState } from '@/page-layout/states/currentPageLayoutIdState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo } from 'react';
import { CommandMenuItemAvailabilityType } from '~/generated-metadata/graphql';

export const useEditableCommandMenuItems = () => {
  const commandMenuContextApi = useCurrentCommandMenuContextApi();
  const commandMenuItemsDraft = useAtomStateValue(commandMenuItemsDraftState);
  const currentPageLayoutId = useAtomStateValue(currentPageLayoutIdState);
  const mainContextStoreHasSelectedRecords = useAtomStateValue(
    mainContextStoreHasSelectedRecordsSelector,
  );

  return useMemo(() => {
    const currentObjectMetadataItemId =
      commandMenuContextApi.objectMetadataItem.id;

    return (commandMenuItemsDraft ?? [])
      .filter(
        doesCommandMenuItemMatchObjectMetadataId(currentObjectMetadataItemId),
      )
      .filter(doesCommandMenuItemMatchPageType(commandMenuContextApi.pageType))
      .filter(
        doesCommandMenuItemMatchSelectionState(
          mainContextStoreHasSelectedRecords,
        ),
      )
      .filter(
        (item) =>
          item.availabilityType !== CommandMenuItemAvailabilityType.FALLBACK,
      )
      .filter(doesCommandMenuItemMatchPageLayoutId(currentPageLayoutId))
      .sort(
        (firstItem, secondItem) => firstItem.position - secondItem.position,
      );
  }, [
    commandMenuItemsDraft,
    commandMenuContextApi,
    currentPageLayoutId,
    mainContextStoreHasSelectedRecords,
  ]);
};
