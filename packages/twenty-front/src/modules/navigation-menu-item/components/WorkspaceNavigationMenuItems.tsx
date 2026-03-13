import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useNavigate } from 'react-router-dom';
import {
  IconColumnInsertRight,
  IconLink,
  IconPlus,
  IconTool,
  useIcons,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { FOLDER_ICON_DEFAULT } from '@/navigation-menu-item/constants/FolderIconDefault';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { useOpenNavigationMenuItemInSidePanel } from '@/navigation-menu-item/hooks/useOpenNavigationMenuItemInSidePanel';
import { useSortedNavigationMenuItems } from '@/navigation-menu-item/hooks/useSortedNavigationMenuItems';
import {
  type NavigationMenuItemClickParams,
  useWorkspaceSectionItems,
} from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/states/isNavigationMenuInEditModeState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { openNavigationMenuItemFolderIdsState } from '@/navigation-menu-item/states/openNavigationMenuItemFolderIdsState';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/utils/filterWorkspaceNavigationMenuItems';
import { preloadWorkspaceDndKit } from '@/navigation/preloadWorkspaceDndKit';
import { NavigationDrawerSectionForWorkspaceItems } from '@/object-metadata/components/NavigationDrawerSectionForWorkspaceItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { navigationMenuItemsState } from '@/navigation-menu-item/states/navigationMenuItemsState';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useStore } from 'jotai';
import { SidePanelPages } from 'twenty-shared/types';

const StyledRightIconsContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

export const WorkspaceNavigationMenuItems = () => {
  const items = useWorkspaceSectionItems();
  const { workspaceNavigationMenuItemsSorted } = useSortedNavigationMenuItems();
  const store = useStore();
  const enterEditMode = () => {
    const currentNavigationMenuItems = store.get(navigationMenuItemsState.atom);
    const workspaceNavigationMenuItems = filterWorkspaceNavigationMenuItems(
      currentNavigationMenuItems,
    );
    store.set(navigationMenuItemsDraftState.atom, workspaceNavigationMenuItems);
    store.set(isNavigationMenuInEditModeState.atom, true);
  };
  const isNavigationMenuInEditMode = useAtomStateValue(
    isNavigationMenuInEditModeState,
  );
  const [
    selectedNavigationMenuItemInEditMode,
    setSelectedNavigationMenuItemInEditMode,
  ] = useAtomState(selectedNavigationMenuItemInEditModeState);
  const setOpenNavigationMenuItemFolderIds = useSetAtomState(
    openNavigationMenuItemFolderIdsState,
  );
  const navigate = useNavigate();
  const { navigateSidePanel } = useNavigateSidePanel();
  const { openNavigationMenuItemInSidePanel } =
    useOpenNavigationMenuItemInSidePanel();
  const { getIcon } = useIcons();

  const { t } = useLingui();

  const handleEditClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    enterEditMode();
  };

  const openFolderAndNavigateToFirstChild = (
    folderId: string,
    item: NavigationMenuItemClickParams['item'],
  ) => {
    setOpenNavigationMenuItemFolderIds((current) =>
      current.includes(folderId) ? current : [...current, folderId],
    );
    openNavigationMenuItemInSidePanel({
      pageTitle: t`Edit folder`,
      pageIcon: getIcon(item.icon ?? item.Icon ?? FOLDER_ICON_DEFAULT),
    });
    const firstChild = workspaceNavigationMenuItemsSorted.find(
      (navItem) =>
        navItem.folderId === folderId &&
        navItem.itemType !== NavigationMenuItemType.LINK &&
        isNonEmptyString(navItem.link),
    );
    if (firstChild?.link) {
      navigate(firstChild.link);
    }
  };

  const openViewOrRecordEditPanelAndNavigate = (
    item: NavigationMenuItemClickParams['item'],
    objectMetadataItem: ObjectMetadataItem | null | undefined,
  ) => {
    if (objectMetadataItem) {
      openNavigationMenuItemInSidePanel({
        pageTitle:
          item.itemType === NavigationMenuItemType.VIEW
            ? item.labelIdentifier
            : objectMetadataItem.labelSingular,
        pageIcon: getIcon(objectMetadataItem.icon),
      });
    }
    const link = 'link' in item ? item.link : undefined;
    if (isNonEmptyString(link)) {
      navigate(link);
    }
  };

  const handleNavigationMenuItemClick = (
    params: NavigationMenuItemClickParams,
  ) => {
    const { item, objectMetadataItem } = params;
    setSelectedNavigationMenuItemInEditMode(item.id);

    switch (item.itemType) {
      case NavigationMenuItemType.FOLDER:
        openFolderAndNavigateToFirstChild(item.id, item);
        break;
      case NavigationMenuItemType.LINK:
        openNavigationMenuItemInSidePanel({
          pageTitle: t`Edit link`,
          pageIcon: IconLink,
        });
        break;
      default:
        openViewOrRecordEditPanelAndNavigate(item, objectMetadataItem);
    }
  };

  const handleActiveObjectMetadataItemClick = (
    objectMetadataItem: ObjectMetadataItem,
    navigationMenuItemId: string,
  ) => {
    enterEditMode();
    setSelectedNavigationMenuItemInEditMode(navigationMenuItemId);
    openNavigationMenuItemInSidePanel({
      pageTitle: objectMetadataItem.labelSingular,
      pageIcon: getIcon(objectMetadataItem.icon),
    });
  };

  const handleAddMenuItem = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    navigateSidePanel({
      page: SidePanelPages.NavigationMenuAddItem,
      pageTitle: t`New sidebar item`,
      pageIcon: IconColumnInsertRight,
      resetNavigationStack: true,
    });
  };

  return (
    <NavigationDrawerSectionForWorkspaceItems
      sectionTitle={t`Workspace`}
      items={items}
      rightIcon={
        <StyledRightIconsContainer>
          {isNavigationMenuInEditMode ? (
            <LightIconButton
              Icon={IconPlus}
              accent="tertiary"
              size="small"
              onClick={handleAddMenuItem}
            />
          ) : (
            <div onMouseEnter={preloadWorkspaceDndKit}>
              <LightIconButton
                Icon={IconTool}
                accent="tertiary"
                size="small"
                onClick={handleEditClick}
              />
            </div>
          )}
        </StyledRightIconsContainer>
      }
      selectedNavigationMenuItemId={selectedNavigationMenuItemInEditMode}
      onNavigationMenuItemClick={
        isNavigationMenuInEditMode ? handleNavigationMenuItemClick : undefined
      }
      onActiveObjectMetadataItemClick={handleActiveObjectMetadataItemClick}
    />
  );
};
