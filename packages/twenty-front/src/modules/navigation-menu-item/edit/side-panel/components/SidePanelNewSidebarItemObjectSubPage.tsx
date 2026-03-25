import { useState } from 'react';

import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';
import { useDraftNavigationMenuItems } from '@/navigation-menu-item/edit/hooks/useDraftNavigationMenuItems';
import { useNavigationMenuObjectMetadataFromDraft } from '@/navigation-menu-item/edit/hooks/useNavigationMenuObjectMetadataFromDraft';
import { useOpenNavigationMenuItemInSidePanel } from '@/navigation-menu-item/edit/hooks/useOpenNavigationMenuItemInSidePanel';
import { pendingInsertionNavigationMenuItemState } from '@/navigation-menu-item/common/states/pendingInsertionNavigationMenuItemState';
import { useAddObjectToNavigationMenuDraft } from '@/navigation-menu-item/edit/object/hooks/useAddObjectToNavigationMenuDraft';
import { SidePanelObjectPickerSubView } from '@/navigation-menu-item/edit/side-panel/components/SidePanelObjectPickerSubView';
import { getAvailableObjectMetadataForNewSidebarItem } from '@/navigation-menu-item/edit/side-panel/utils/getAvailableObjectMetadataForNewSidebarItem';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useSidePanelSubPageHistory } from '@/side-panel/hooks/useSidePanelSubPageHistory';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { ViewKey } from '@/views/types/ViewKey';
import { useIcons } from 'twenty-ui/display';

export const SidePanelNewSidebarItemObjectSubPage = () => {
  const { navigateToSidePanelSubPage } = useSidePanelSubPageHistory();
  const { getIcon } = useIcons();
  const [objectSearchInput, setObjectSearchInput] = useState('');

  const { currentDraft } = useDraftNavigationMenuItems();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { addObjectToDraft } = useAddObjectToNavigationMenuDraft();
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
    objectMetadataIdsInWorkspace,
  } = useNavigationMenuObjectMetadataFromDraft(currentDraft);

  const objectMetadataIdsWithDisplayableViews = new Set(
    views
      .filter((view) => view.key !== ViewKey.INDEX)
      .map((view) => view.objectMetadataId),
  );

  const { availableObjectMetadataItems } =
    getAvailableObjectMetadataForNewSidebarItem({
      objectMetadataItems,
      activeNonSystemObjectMetadataItems,
      objectMetadataIdsWithIndexView,
      objectMetadataIdsWithDisplayableViews,
    });

  const handleSelectObject = (
    objectMetadataItem: EnrichedObjectMetadataItem,
  ) => {
    if (objectMetadataIdsInWorkspace.has(objectMetadataItem.id)) {
      return;
    }
    const itemId = addObjectToDraft({
      objectMetadataId: objectMetadataItem.id,
      currentDraft,
      targetFolderId: pendingInsertionNavigationMenuItem?.folderId,
      targetIndex: pendingInsertionNavigationMenuItem?.position,
      color: getObjectColorWithFallback(objectMetadataItem),
    });
    setPendingInsertionNavigationMenuItem(null);
    openNavigationMenuItemInSidePanel({
      itemId,
      pageTitle: objectMetadataItem.labelSingular,
      pageIcon: getIcon(objectMetadataItem.icon),
    });
  };

  return (
    <SidePanelObjectPickerSubView
      objects={availableObjectMetadataItems}
      searchValue={objectSearchInput}
      onSearchChange={setObjectSearchInput}
      onOpenSystemPicker={() =>
        navigateToSidePanelSubPage(
          SidePanelSubPages.NewSidebarItemObjectSystemPicker,
        )
      }
      isViewItem={false}
      onChangeObject={handleSelectObject}
      objectMenuItemVariant="add"
    />
  );
};
