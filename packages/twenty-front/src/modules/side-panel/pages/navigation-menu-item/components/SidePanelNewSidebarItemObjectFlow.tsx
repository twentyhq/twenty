import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { SidePanelObjectPickerSubView } from '@/side-panel/pages/navigation-menu-item/components/SidePanelObjectPickerSubView';
import { SidePanelSystemObjectPickerSubView } from '@/side-panel/pages/navigation-menu-item/components/SidePanelSystemObjectPickerSubView';
import { getAvailableObjectMetadataForNewSidebarItem } from '@/side-panel/pages/navigation-menu-item/utils/getAvailableObjectMetadataForNewSidebarItem';
import { useAddObjectToNavigationMenuDraft } from '@/navigation-menu-item/hooks/useAddObjectToNavigationMenuDraft';
import { getStandardObjectIconColor } from '@/navigation-menu-item/utils/getStandardObjectIconColor';
import { useDraftNavigationMenuItems } from '@/navigation-menu-item/hooks/useDraftNavigationMenuItems';
import { useNavigationMenuObjectMetadataFromDraft } from '@/navigation-menu-item/hooks/useNavigationMenuObjectMetadataFromDraft';
import { addMenuItemInsertionContextState } from '@/navigation-menu-item/states/addMenuItemInsertionContextState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ViewKey } from '@/views/types/ViewKey';

type SidePanelNewSidebarItemObjectFlowProps = {
  onBack: () => void;
};

export const SidePanelNewSidebarItemObjectFlow = ({
  onBack,
}: SidePanelNewSidebarItemObjectFlowProps) => {
  const { t } = useLingui();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const [objectSearchInput, setObjectSearchInput] = useState('');
  const [systemObjectSearchInput, setSystemObjectSearchInput] = useState('');
  const [isInSystemPicker, setIsInSystemPicker] = useState(false);

  const { currentDraft } = useDraftNavigationMenuItems();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { addObjectToDraft } = useAddObjectToNavigationMenuDraft();
  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();
  const addMenuItemInsertionContext = useAtomStateValue(
    addMenuItemInsertionContextState,
  );
  const setAddMenuItemInsertionContext = useSetAtomState(
    addMenuItemInsertionContextState,
  );
  const {
    views,
    objectMetadataIdsWithIndexView,
    objectMetadataIdsInWorkspace,
  } = useNavigationMenuObjectMetadataFromDraft(currentDraft);

  const objectMetadataIdsWithDisplayableViews = new Set(
    views
      .filter((view) => view.key !== ViewKey.Index)
      .map((view) => view.objectMetadataId),
  );

  const { availableObjectMetadataItems, availableSystemObjectMetadataItems } =
    getAvailableObjectMetadataForNewSidebarItem({
      objectMetadataItems,
      activeNonSystemObjectMetadataItems,
      objectMetadataIdsWithIndexView,
      objectMetadataIdsWithDisplayableViews,
    });

  const handleSelectObject = (
    objectMetadataItem: ObjectMetadataItem,
    defaultViewId: string,
  ) => {
    if (objectMetadataIdsInWorkspace.has(objectMetadataItem.id)) {
      return;
    }
    addObjectToDraft(
      objectMetadataItem.id,
      defaultViewId,
      currentDraft,
      addMenuItemInsertionContext?.targetFolderId,
      addMenuItemInsertionContext?.targetIndex,
      getStandardObjectIconColor(objectMetadataItem.nameSingular),
    );
    setAddMenuItemInsertionContext(null);
    closeSidePanelMenu();
  };

  const handleBackToObjectList = () => {
    setIsInSystemPicker(false);
    setSystemObjectSearchInput('');
  };

  if (isInSystemPicker) {
    return (
      <SidePanelSystemObjectPickerSubView
        systemObjects={availableSystemObjectMetadataItems}
        searchValue={systemObjectSearchInput}
        onSearchChange={setSystemObjectSearchInput}
        onBack={handleBackToObjectList}
        isViewItem={false}
        onChangeObject={handleSelectObject}
        objectMenuItemVariant="add"
        emptyNoResultsText={t`All system objects are already in the sidebar`}
      />
    );
  }

  return (
    <SidePanelObjectPickerSubView
      objects={availableObjectMetadataItems}
      searchValue={objectSearchInput}
      onSearchChange={setObjectSearchInput}
      onBack={onBack}
      onOpenSystemPicker={() => setIsInSystemPicker(true)}
      isViewItem={false}
      onChangeObject={handleSelectObject}
      objectMenuItemVariant="add"
    />
  );
};
