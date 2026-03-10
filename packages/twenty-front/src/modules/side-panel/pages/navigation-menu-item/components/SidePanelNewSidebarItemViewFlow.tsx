import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useDraftNavigationMenuItems } from '@/navigation-menu-item/hooks/useDraftNavigationMenuItems';
import { useNavigationMenuObjectMetadataFromDraft } from '@/navigation-menu-item/hooks/useNavigationMenuObjectMetadataFromDraft';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { SidePanelNewSidebarItemViewObjectPickerSubView } from '@/side-panel/pages/navigation-menu-item/components/SidePanelNewSidebarItemViewObjectPickerSubView';
import { SidePanelNewSidebarItemViewPickerSubView } from '@/side-panel/pages/navigation-menu-item/components/SidePanelNewSidebarItemViewPickerSubView';
import { SidePanelNewSidebarItemViewSystemSubView } from '@/side-panel/pages/navigation-menu-item/components/SidePanelNewSidebarItemViewSystemSubView';
import { getAvailableObjectMetadataForNewSidebarItem } from '@/side-panel/pages/navigation-menu-item/utils/getAvailableObjectMetadataForNewSidebarItem';
import { ViewKey } from '@/views/types/ViewKey';
import { ViewType } from '@/views/types/ViewType';

type SidePanelNewSidebarItemViewFlowProps = {
  onBack: () => void;
};

export const SidePanelNewSidebarItemViewFlow = ({
  onBack,
}: SidePanelNewSidebarItemViewFlowProps) => {
  const [selectedObjectMetadataIdForView, setSelectedObjectMetadataIdForView] =
    useState<string | null>(null);
  const [objectSearchInput, setObjectSearchInput] = useState('');
  const [systemObjectSearchInput, setSystemObjectSearchInput] = useState('');
  const [isInSystemPicker, setIsInSystemPicker] = useState(false);

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
    const selectedObjectMetadataItem = isDefined(
      selectedObjectMetadataIdForView,
    )
      ? objectMetadataItems.find(
          (item) => item.id === selectedObjectMetadataIdForView,
        )
      : undefined;
    const cameFromSystemObjects = selectedObjectMetadataItem?.isSystem ?? false;

    setSelectedObjectMetadataIdForView(null);
    setIsInSystemPicker(cameFromSystemObjects);
  };

  const handleBackFromSystemPicker = () => {
    setIsInSystemPicker(false);
  };

  const handleSelectObject = (objectId: string) => {
    setSelectedObjectMetadataIdForView(objectId);
  };

  const handleSelectObjectFromSystem = (objectId: string) => {
    setSelectedObjectMetadataIdForView(objectId);
    setIsInSystemPicker(false);
  };

  if (isDefined(selectedObjectMetadataIdForView) && !isInSystemPicker) {
    return (
      <SidePanelNewSidebarItemViewPickerSubView
        selectedObjectMetadataIdForView={selectedObjectMetadataIdForView}
        onBack={handleBackFromViewPicker}
      />
    );
  }

  if (isInSystemPicker) {
    return (
      <SidePanelNewSidebarItemViewSystemSubView
        systemObjects={availableSystemObjectMetadataItemsForView}
        searchValue={systemObjectSearchInput}
        onSearchChange={setSystemObjectSearchInput}
        onBack={handleBackFromSystemPicker}
        onSelectObject={(item) => handleSelectObjectFromSystem(item.id)}
      />
    );
  }

  return (
    <SidePanelNewSidebarItemViewObjectPickerSubView
      objects={objectMetadataItemsWithViews}
      searchValue={objectSearchInput}
      onSearchChange={setObjectSearchInput}
      onBack={onBack}
      onOpenSystemPicker={() => setIsInSystemPicker(true)}
      onSelectObject={(item) => handleSelectObject(item.id)}
      showSystemObjectsOption={
        availableSystemObjectMetadataItemsForView.length > 0
      }
    />
  );
};
