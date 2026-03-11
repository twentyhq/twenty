import { useDraftNavigationMenuItems } from '@/navigation-menu-item/hooks/useDraftNavigationMenuItems';
import { useNavigationMenuObjectMetadataFromDraft } from '@/navigation-menu-item/hooks/useNavigationMenuObjectMetadataFromDraft';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useSidePanelSubPageHistory } from '@/side-panel/hooks/useSidePanelSubPageHistory';
import { SidePanelNewSidebarItemViewSystemSubView } from '@/side-panel/pages/navigation-menu-item/components/SidePanelNewSidebarItemViewSystemSubView';
import { getAvailableObjectMetadataForNewSidebarItem } from '@/side-panel/pages/navigation-menu-item/utils/getAvailableObjectMetadataForNewSidebarItem';
import { selectedObjectMetadataIdForViewFlowState } from '@/side-panel/states/selectedObjectMetadataIdForViewFlowState';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { ViewKey } from '@/views/types/ViewKey';
import { ViewType } from '@/views/types/ViewType';
import { useState } from 'react';

export const SidePanelNewSidebarItemViewSystemPickerSubPage = () => {
  const { navigateToSidePanelSubPage } = useSidePanelSubPageHistory();
  const [searchValue, setSearchValue] = useState('');
  const setSelectedObjectMetadataIdForViewFlow = useSetAtomComponentState(
    selectedObjectMetadataIdForViewFlowState,
  );

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

  const { availableSystemObjectMetadataItemsForView } =
    getAvailableObjectMetadataForNewSidebarItem({
      objectMetadataItems,
      activeNonSystemObjectMetadataItems,
      objectMetadataIdsWithIndexView,
      objectMetadataIdsWithDisplayableViews,
    });

  const handleSelectObject = (objectMetadataItem: ObjectMetadataItem) => {
    setSelectedObjectMetadataIdForViewFlow(objectMetadataItem.id);
    navigateToSidePanelSubPage(
      SidePanelSubPages.NewSidebarItemViewPicker,
      objectMetadataItem.labelPlural,
    );
  };

  return (
    <SidePanelNewSidebarItemViewSystemSubView
      systemObjects={availableSystemObjectMetadataItemsForView}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      onSelectObject={handleSelectObject}
    />
  );
};
