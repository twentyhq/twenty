import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useDraftNavigationMenuItems } from '@/navigation-menu-item/hooks/useDraftNavigationMenuItems';
import { useNavigationMenuObjectMetadataFromDraft } from '@/navigation-menu-item/hooks/useNavigationMenuObjectMetadataFromDraft';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useSidePanelSubPageHistory } from '@/side-panel/hooks/useSidePanelSubPageHistory';
import { SidePanelNewSidebarItemViewObjectPickerSubView } from '@/side-panel/pages/navigation-menu-item/components/SidePanelNewSidebarItemViewObjectPickerSubView';
import { SidePanelNewSidebarItemViewPickerSubView } from '@/side-panel/pages/navigation-menu-item/components/SidePanelNewSidebarItemViewPickerSubView';
import { SidePanelNewSidebarItemViewSystemSubView } from '@/side-panel/pages/navigation-menu-item/components/SidePanelNewSidebarItemViewSystemSubView';
import { getAvailableObjectMetadataForNewSidebarItem } from '@/side-panel/pages/navigation-menu-item/utils/getAvailableObjectMetadataForNewSidebarItem';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import { ViewKey } from '@/views/types/ViewKey';
import { ViewType } from '@/views/types/ViewType';

export const SidePanelNewSidebarItemViewFlow = () => {
  const {
    currentSidePanelSubPage,
    navigateToSidePanelSubPage,
    goBackFromSidePanelSubPage,
  } = useSidePanelSubPageHistory();

  const [selectedObjectMetadataIdForView, setSelectedObjectMetadataIdForView] =
    useState<string | null>(null);
  const [objectSearchInput, setObjectSearchInput] = useState('');
  const [systemObjectSearchInput, setSystemObjectSearchInput] = useState('');

  const { currentDraft } = useDraftNavigationMenuItems();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();
  const { views, objectMetadataIdsWithIndexView } =
    useNavigationMenuObjectMetadataFromDraft(currentDraft);

  const objectMetadataIdsWithDisplayableViews = new Set(
    views
      .filter(
        (view) =>
          view.key !== ViewKey.Index && view.type !== ViewType.FieldsWidget,
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

  const handleBackFromViewPicker = () => {
    setSelectedObjectMetadataIdForView(null);
    goBackFromSidePanelSubPage();
  };

  const handleSelectObject = (objectId: string) => {
    setSelectedObjectMetadataIdForView(objectId);
    const objectMetadataItem = objectMetadataItems.find(
      (item) => item.id === objectId,
    );
    navigateToSidePanelSubPage(
      SidePanelSubPages.NewSidebarItemViewPicker,
      objectMetadataItem?.labelPlural,
    );
  };

  const handleSelectObjectFromSystem = (objectId: string) => {
    setSelectedObjectMetadataIdForView(objectId);
    const objectMetadataItem = objectMetadataItems.find(
      (item) => item.id === objectId,
    );
    navigateToSidePanelSubPage(
      SidePanelSubPages.NewSidebarItemViewPicker,
      objectMetadataItem?.labelPlural,
    );
  };

  switch (currentSidePanelSubPage?.subPage) {
    case SidePanelSubPages.NewSidebarItemViewPicker:
      if (!isDefined(selectedObjectMetadataIdForView)) {
        return null;
      }
      return (
        <SidePanelNewSidebarItemViewPickerSubView
          selectedObjectMetadataIdForView={selectedObjectMetadataIdForView}
          onBack={handleBackFromViewPicker}
        />
      );
    case SidePanelSubPages.NewSidebarItemViewSystemPicker:
      return (
        <SidePanelNewSidebarItemViewSystemSubView
          systemObjects={availableSystemObjectMetadataItemsForView}
          searchValue={systemObjectSearchInput}
          onSearchChange={setSystemObjectSearchInput}
          onBack={goBackFromSidePanelSubPage}
          onSelectObject={(item) => handleSelectObjectFromSystem(item.id)}
        />
      );
    case SidePanelSubPages.NewSidebarItemViewObjectPicker:
    default:
      return (
        <SidePanelNewSidebarItemViewObjectPickerSubView
          objects={objectMetadataItemsWithViews}
          searchValue={objectSearchInput}
          onSearchChange={setObjectSearchInput}
          onBack={goBackFromSidePanelSubPage}
          onOpenSystemPicker={() =>
            navigateToSidePanelSubPage(
              SidePanelSubPages.NewSidebarItemViewSystemPicker,
            )
          }
          onSelectObject={(item) => handleSelectObject(item.id)}
          showSystemObjectsOption={
            availableSystemObjectMetadataItemsForView.length > 0
          }
        />
      );
  }
};
