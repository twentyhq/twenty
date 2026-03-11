import { useLingui } from '@lingui/react/macro';

import { useAddObjectToNavigationMenuDraft } from '@/navigation-menu-item/hooks/useAddObjectToNavigationMenuDraft';
import { useDraftNavigationMenuItems } from '@/navigation-menu-item/hooks/useDraftNavigationMenuItems';
import { useNavigationMenuObjectMetadataFromDraft } from '@/navigation-menu-item/hooks/useNavigationMenuObjectMetadataFromDraft';
import { useOpenNavigationMenuItemInSidePanel } from '@/navigation-menu-item/hooks/useOpenNavigationMenuItemInSidePanel';
import { addMenuItemInsertionContextState } from '@/navigation-menu-item/states/addMenuItemInsertionContextState';
import { getStandardObjectIconColor } from '@/navigation-menu-item/utils/getStandardObjectIconColor';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SidePanelSystemObjectPickerSubView } from '@/side-panel/pages/navigation-menu-item/components/SidePanelSystemObjectPickerSubView';
import { getAvailableObjectMetadataForNewSidebarItem } from '@/side-panel/pages/navigation-menu-item/utils/getAvailableObjectMetadataForNewSidebarItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { ViewKey } from '@/views/types/ViewKey';
import { useState } from 'react';
import { useIcons } from 'twenty-ui/display';

export const SidePanelNewSidebarItemObjectSystemPickerSubPage = () => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const [searchValue, setSearchValue] = useState('');

  const { currentDraft } = useDraftNavigationMenuItems();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { addObjectToDraft } = useAddObjectToNavigationMenuDraft();
  const { openNavigationMenuItemInSidePanel } =
    useOpenNavigationMenuItemInSidePanel();
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

  const { availableSystemObjectMetadataItems } =
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
    const itemId = addObjectToDraft(
      objectMetadataItem.id,
      defaultViewId,
      currentDraft,
      addMenuItemInsertionContext?.targetFolderId,
      addMenuItemInsertionContext?.targetIndex,
      getStandardObjectIconColor(objectMetadataItem.nameSingular),
    );
    setAddMenuItemInsertionContext(null);
    openNavigationMenuItemInSidePanel({
      itemId,
      pageTitle: objectMetadataItem.labelSingular,
      pageIcon: getIcon(objectMetadataItem.icon),
    });
  };

  const disableDrag = addMenuItemInsertionContext?.disableDrag === true;

  return (
    <SidePanelSystemObjectPickerSubView
      systemObjects={availableSystemObjectMetadataItems}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      isViewItem={false}
      onChangeObject={handleSelectObject}
      objectMenuItemVariant="add"
      emptyNoResultsText={t`All system objects are already in the sidebar`}
      disableDrag={disableDrag}
    />
  );
};
