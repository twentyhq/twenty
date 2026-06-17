import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { NavigationMenuItemType } from 'twenty-shared/types';

import { pendingInsertionNavigationMenuItemState } from '@/navigation-menu-item/common/states/pendingInsertionNavigationMenuItemState';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { useNavigationMenuObjectMetadataForSection } from '@/navigation-menu-item/edit/hooks/useNavigationMenuObjectMetadataForSection';
import { useOpenNavigationMenuItemInSidePanel } from '@/navigation-menu-item/edit/hooks/useOpenNavigationMenuItemInSidePanel';
import { SidePanelSystemObjectPickerSubView } from '@/navigation-menu-item/edit/side-panel/components/SidePanelSystemObjectPickerSubView';
import { getAvailableObjectMetadataForNewSidebarItem } from '@/navigation-menu-item/edit/side-panel/utils/getAvailableObjectMetadataForNewSidebarItem';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { ViewKey } from '@/views/types/ViewKey';
import { useIcons } from 'twenty-ui/display';

export const SidePanelNewSidebarItemObjectSystemPickerSubPage = () => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const [searchValue, setSearchValue] = useState('');

  const { currentItems, createItem } = useNavigationMenuItemEditController();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { openNavigationMenuItemInSidePanel } =
    useOpenNavigationMenuItemInSidePanel();
  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();
  const [
    pendingInsertionNavigationMenuItem,
    setPendingInsertionNavigationMenuItem,
  ] = useAtomState(pendingInsertionNavigationMenuItemState);
  const {
    views,
    objectMetadataIdsWithIndexView,
    objectMetadataIdsAlreadyAdded,
  } = useNavigationMenuObjectMetadataForSection(currentItems);

  const objectMetadataIdsWithDisplayableViews = new Set(
    views
      .filter((view) => view.key !== ViewKey.INDEX)
      .map((view) => view.objectMetadataId),
  );

  const { availableSystemObjectMetadataItems } =
    getAvailableObjectMetadataForNewSidebarItem({
      objectMetadataItems,
      activeNonSystemObjectMetadataItems,
      objectMetadataIdsWithIndexView,
      objectMetadataIdsWithDisplayableViews,
    });

  const handleSelectObject = (
    objectMetadataItem: EnrichedObjectMetadataItem,
  ) => {
    if (objectMetadataIdsAlreadyAdded.has(objectMetadataItem.id)) {
      return;
    }
    const itemId = createItem(
      {
        type: NavigationMenuItemType.OBJECT,
        targetObjectMetadataId: objectMetadataItem.id,
        color: getObjectColorWithFallback(objectMetadataItem),
      },
      {
        targetFolderId: pendingInsertionNavigationMenuItem?.folderId,
        targetIndex: pendingInsertionNavigationMenuItem?.position,
      },
    );
    setPendingInsertionNavigationMenuItem(null);
    openNavigationMenuItemInSidePanel({
      itemId,
      pageTitle: objectMetadataItem.labelSingular,
      pageIcon: getIcon(objectMetadataItem.icon),
    });
  };

  return (
    <SidePanelSystemObjectPickerSubView
      systemObjects={availableSystemObjectMetadataItems}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      isViewItem={false}
      onChangeObject={handleSelectObject}
      objectMenuItemVariant="add"
      emptyNoResultsText={t`All system objects are already in the sidebar`}
    />
  );
};
