import { useDraftNavigationMenuItems } from '@/navigation-menu-item/edit/hooks/useDraftNavigationMenuItems';
import { useNavigationMenuObjectMetadataFromDraft } from '@/navigation-menu-item/edit/hooks/useNavigationMenuObjectMetadataFromDraft';
import { SidePanelNewSidebarItemViewObjectPickerSubView } from '@/navigation-menu-item/edit/side-panel/components/SidePanelNewSidebarItemViewObjectPickerSubView';
import { getAvailableObjectMetadataForNewSidebarItem } from '@/navigation-menu-item/edit/side-panel/utils/getAvailableObjectMetadataForNewSidebarItem';
import { isViewDisplayableInNavigationMenu } from '@/navigation-menu-item/edit/side-panel/utils/isViewDisplayableInNavigationMenu';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useSidePanelSubPageHistory } from '@/side-panel/hooks/useSidePanelSubPageHistory';
import { selectedObjectMetadataIdForViewFlowState } from '@/side-panel/states/selectedObjectMetadataIdForViewFlowState';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useState } from 'react';

export const SidePanelNewSidebarItemViewObjectPickerSubPage = () => {
  const { navigateToSidePanelSubPage } = useSidePanelSubPageHistory();
  const [searchValue, setSearchValue] = useState('');
  const setSelectedObjectMetadataIdForViewFlow = useSetAtomComponentState(
    selectedObjectMetadataIdForViewFlowState,
  );

  const { currentDraft } = useDraftNavigationMenuItems();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();
  const { views, objectMetadataIdsWithIndexView, viewIdsInWorkspace } =
    useNavigationMenuObjectMetadataFromDraft(currentDraft);

  const objectMetadataIdsWithDisplayableViews = new Set(
    views
      .filter(
        (view) =>
          isViewDisplayableInNavigationMenu(view) &&
          !viewIdsInWorkspace.has(view.id),
      )
      .map((view) => view.objectMetadataId),
  );

  const {
    objectMetadataItemsWithViews,
    availableSystemObjectMetadataItemsForView,
  } = getAvailableObjectMetadataForNewSidebarItem({
    objectMetadataItems,
    activeNonSystemObjectMetadataItems,
    objectMetadataIdsWithIndexView,
    objectMetadataIdsWithDisplayableViews,
  });

  const handleSelectObject = (
    objectMetadataItem: EnrichedObjectMetadataItem,
  ) => {
    setSelectedObjectMetadataIdForViewFlow(objectMetadataItem.id);
    navigateToSidePanelSubPage(
      SidePanelSubPages.NewSidebarItemViewPicker,
      objectMetadataItem.labelPlural,
    );
  };

  return (
    <SidePanelNewSidebarItemViewObjectPickerSubView
      objects={objectMetadataItemsWithViews}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      onOpenSystemPicker={() =>
        navigateToSidePanelSubPage(
          SidePanelSubPages.NewSidebarItemViewSystemPicker,
        )
      }
      onSelectObject={handleSelectObject}
      showSystemObjectsOption={
        availableSystemObjectMetadataItemsForView.length > 0
      }
    />
  );
};
