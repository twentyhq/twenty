import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconFolder, IconLink } from 'twenty-ui/display';

import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { CommandMenuNewSidebarItemMainMenu } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuNewSidebarItemMainMenu';
import { CommandMenuNewSidebarItemRecordSubView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuNewSidebarItemRecordSubView';
import { CommandMenuNewSidebarItemViewObjectPickerSubView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuNewSidebarItemViewObjectPickerSubView';
import { CommandMenuNewSidebarItemViewPickerSubView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuNewSidebarItemViewPickerSubView';
import { CommandMenuNewSidebarItemViewSystemSubView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuNewSidebarItemViewSystemSubView';
import { CommandMenuObjectPickerSubView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuObjectPickerSubView';
import { CommandMenuSystemObjectPickerSubView } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuSystemObjectPickerSubView';
import { useAddFolderToNavigationMenuDraft } from '@/navigation-menu-item/hooks/useAddFolderToNavigationMenuDraft';
import { useAddLinkToNavigationMenuDraft } from '@/navigation-menu-item/hooks/useAddLinkToNavigationMenuDraft';
import { useAddObjectToNavigationMenuDraft } from '@/navigation-menu-item/hooks/useAddObjectToNavigationMenuDraft';
import { useNavigationMenuItemsDraftState } from '@/navigation-menu-item/hooks/useNavigationMenuItemsDraftState';
import { useNavigationMenuObjectMetadataFromDraft } from '@/navigation-menu-item/hooks/useNavigationMenuObjectMetadataFromDraft';
import { useOpenNavigationMenuItemInCommandMenu } from '@/navigation-menu-item/hooks/useOpenNavigationMenuItemInCommandMenu';
import { addMenuItemInsertionContextState } from '@/navigation-menu-item/states/addMenuItemInsertionContextState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ViewKey } from '@/views/types/ViewKey';

type SelectedOption =
  | 'object'
  | 'record'
  | 'system'
  | 'view'
  | 'view-system'
  | null;

export const CommandMenuNewSidebarItemPage = () => {
  const { t } = useLingui();
  const { closeCommandMenu } = useCommandMenu();
  const [selectedOption, setSelectedOption] = useState<SelectedOption>(null);
  const [selectedObjectMetadataIdForView, setSelectedObjectMetadataIdForView] =
    useState<string | null>(null);
  const [objectSearchInput, setObjectSearchInput] = useState('');
  const [systemObjectSearchInput, setSystemObjectSearchInput] = useState('');

  const { objectMetadataItems } = useObjectMetadataItems();
  const { addObjectToDraft } = useAddObjectToNavigationMenuDraft();
  const { addFolderToDraft } = useAddFolderToNavigationMenuDraft();
  const { addLinkToDraft } = useAddLinkToNavigationMenuDraft();
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsDraftState();
  const navigationMenuItemsDraft = useRecoilValue(
    navigationMenuItemsDraftState,
  );
  const setSelectedNavigationMenuItemInEditMode = useSetRecoilState(
    selectedNavigationMenuItemInEditModeState,
  );
  const { openNavigationMenuItemInCommandMenu } =
    useOpenNavigationMenuItemInCommandMenu();
  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();

  const currentDraft = isDefined(navigationMenuItemsDraft)
    ? navigationMenuItemsDraft
    : workspaceNavigationMenuItems;

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

  const availableObjectMetadataItems = [
    ...activeNonSystemObjectMetadataItems,
  ].sort((a, b) => a.labelPlural.localeCompare(b.labelPlural));

  const activeSystemObjectMetadataItems = objectMetadataItems
    .filter((item) => item.isActive && item.isSystem)
    .sort((a, b) => a.labelPlural.localeCompare(b.labelPlural));
  const availableSystemObjectMetadataItems =
    activeSystemObjectMetadataItems.filter((item) =>
      objectMetadataIdsWithIndexView.has(item.id),
    );

  const objectMetadataItemsWithViews = objectMetadataItems
    .filter(
      (item) =>
        item.isActive && objectMetadataIdsWithDisplayableViews.has(item.id),
    )
    .filter((item) => !item.isSystem)
    .sort((a, b) => a.labelPlural.localeCompare(b.labelPlural));

  const availableSystemObjectMetadataItemsForView =
    activeSystemObjectMetadataItems.filter((item) =>
      objectMetadataIdsWithDisplayableViews.has(item.id),
    );

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

  const handleBackToMain = () => {
    setSelectedOption(null);
    setSelectedObjectMetadataIdForView(null);
    setObjectSearchInput('');
    setSystemObjectSearchInput('');
  };

  const handleBackToObjectList = () => {
    setSelectedOption('object');
    setSystemObjectSearchInput('');
  };

  const handleBackToViewObjectList = () => {
    const selectedObjectMetadataItem = isDefined(
      selectedObjectMetadataIdForView,
    )
      ? objectMetadataItems.find(
          (item) => item.id === selectedObjectMetadataIdForView,
        )
      : undefined;
    const cameFromSystemObjects = selectedObjectMetadataItem?.isSystem ?? false;

    setSelectedObjectMetadataIdForView(null);
    if (cameFromSystemObjects) {
      setSelectedOption('view-system');
    }
  };

  const handleBackToViewObjectListFromSystem = () => {
    setSelectedOption('view');
    setSystemObjectSearchInput('');
  };

  const handleAddFolderAndOpenEdit = () => {
    const newFolderId = addFolderToDraft(
      t`New folder`,
      currentDraft,
      addMenuItemInsertionContext?.targetFolderId ?? null,
      addMenuItemInsertionContext?.targetIndex,
    );
    setAddMenuItemInsertionContext(null);
    setSelectedNavigationMenuItemInEditMode(newFolderId);
    openNavigationMenuItemInCommandMenu({
      pageTitle: t`Edit folder`,
      pageIcon: IconFolder,
      focusTitleInput: true,
    });
  };

  const handleAddLinkAndOpenEdit = () => {
    const newLinkId = addLinkToDraft(
      t`Link label`,
      'www.example.com',
      currentDraft,
      addMenuItemInsertionContext?.targetFolderId ?? null,
      addMenuItemInsertionContext?.targetIndex,
    );
    setAddMenuItemInsertionContext(null);
    setSelectedNavigationMenuItemInEditMode(newLinkId);
    openNavigationMenuItemInCommandMenu({
      pageTitle: t`Edit link`,
      pageIcon: IconLink,
      focusTitleInput: true,
    });
  };

  switch (selectedOption) {
    case 'view':
      if (isDefined(selectedObjectMetadataIdForView)) {
        return (
          <CommandMenuNewSidebarItemViewPickerSubView
            selectedObjectMetadataIdForView={selectedObjectMetadataIdForView}
            onBack={handleBackToViewObjectList}
          />
        );
      }
      return (
        <CommandMenuNewSidebarItemViewObjectPickerSubView
          objects={objectMetadataItemsWithViews}
          searchValue={objectSearchInput}
          onSearchChange={setObjectSearchInput}
          onBack={handleBackToMain}
          onOpenSystemPicker={() => setSelectedOption('view-system')}
          onSelectObject={(item) => setSelectedObjectMetadataIdForView(item.id)}
          showSystemObjectsOption={
            availableSystemObjectMetadataItemsForView.length > 0
          }
        />
      );
    case 'view-system':
      return (
        <CommandMenuNewSidebarItemViewSystemSubView
          systemObjects={availableSystemObjectMetadataItemsForView}
          searchValue={systemObjectSearchInput}
          onSearchChange={setSystemObjectSearchInput}
          onBack={handleBackToViewObjectListFromSystem}
          onSelectObject={(item) => {
            setSelectedObjectMetadataIdForView(item.id);
            setSelectedOption('view');
          }}
        />
      );
    case 'object':
      return (
        <CommandMenuObjectPickerSubView
          objects={availableObjectMetadataItems}
          searchValue={objectSearchInput}
          onSearchChange={setObjectSearchInput}
          onBack={handleBackToMain}
          onOpenSystemPicker={() => setSelectedOption('system')}
          isViewItem={false}
          onChangeObject={handleSelectObject}
          objectMenuItemVariant="add"
        />
      );
    case 'system':
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
    case 'record':
      return (
        <CommandMenuNewSidebarItemRecordSubView onBack={handleBackToMain} />
      );
    default:
      return (
        <CommandMenuNewSidebarItemMainMenu
          onSelectObject={() => setSelectedOption('object')}
          onSelectView={() => setSelectedOption('view')}
          onSelectRecord={() => setSelectedOption('record')}
          onAddFolder={handleAddFolderAndOpenEdit}
          onAddLink={handleAddLinkAndOpenEdit}
        />
      );
  }
};
