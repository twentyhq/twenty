import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { CommandMenuObjectPickerSubView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuObjectPickerSubView';
import { CommandMenuSystemObjectPickerSubView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuSystemObjectPickerSubView';
import { getAvailableObjectMetadataForNewSidebarItem } from '@/command-menu/pages/navigation-menu-item/utils/getAvailableObjectMetadataForNewSidebarItem';
import { useAddObjectToNavigationMenuDraft } from '@/navigation-menu-item/hooks/useAddObjectToNavigationMenuDraft';
import { useDraftNavigationMenuItems } from '@/navigation-menu-item/hooks/useDraftNavigationMenuItems';
import { useNavigationMenuObjectMetadataFromDraft } from '@/navigation-menu-item/hooks/useNavigationMenuObjectMetadataFromDraft';
import { addMenuItemInsertionContextState } from '@/navigation-menu-item/states/addMenuItemInsertionContextState';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ViewKey } from '@/views/types/ViewKey';

type CommandMenuNewSidebarItemObjectFlowProps = {
  onBack: () => void;
};

export const CommandMenuNewSidebarItemObjectFlow = ({
  onBack,
}: CommandMenuNewSidebarItemObjectFlowProps) => {
  const { t } = useLingui();
  const { closeCommandMenu } = useCommandMenu();
  const [objectSearchInput, setObjectSearchInput] = useState('');
  const [systemObjectSearchInput, setSystemObjectSearchInput] = useState('');
  const [isInSystemPicker, setIsInSystemPicker] = useState(false);

  const { currentDraft } = useDraftNavigationMenuItems();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { addObjectToDraft } = useAddObjectToNavigationMenuDraft();
  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();
  const addMenuItemInsertionContext = useRecoilValue(
    addMenuItemInsertionContextState,
  );
  const setAddMenuItemInsertionContext = useSetRecoilState(
    addMenuItemInsertionContextState,
  );
  const { views, objectMetadataIdsWithIndexView } =
    useNavigationMenuObjectMetadataFromDraft(currentDraft);

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
    addObjectToDraft(
      objectMetadataItem.id,
      defaultViewId,
      currentDraft,
      addMenuItemInsertionContext?.targetFolderId,
      addMenuItemInsertionContext?.targetIndex,
    );
    setAddMenuItemInsertionContext(null);
    closeCommandMenu();
  };

  const handleBackToObjectList = () => {
    setIsInSystemPicker(false);
    setSystemObjectSearchInput('');
  };

  if (isInSystemPicker) {
    return (
      <CommandMenuSystemObjectPickerSubView
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
    <CommandMenuObjectPickerSubView
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
