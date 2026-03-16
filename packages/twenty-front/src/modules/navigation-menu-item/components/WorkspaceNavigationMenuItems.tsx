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
import { NavigationMenuItemType, SidePanelPages } from 'twenty-shared/types';
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
import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/utils/getNavigationMenuItemComputedLink';
import { getNavigationMenuItemLabel } from '@/navigation-menu-item/utils/getNavigationMenuItemLabel';
import { preloadWorkspaceDndKit } from '@/navigation/preloadWorkspaceDndKit';
import { NavigationDrawerSectionForWorkspaceItems } from '@/object-metadata/components/NavigationDrawerSectionForWorkspaceItems';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { navigationMenuItemsSelector } from '@/navigation-menu-item/states/navigationMenuItemsSelector';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { useStore } from 'jotai';

const StyledRightIconsContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

export const WorkspaceNavigationMenuItems = () => {
  const items = useWorkspaceSectionItems();
  const { workspaceNavigationMenuItemsSorted } = useSortedNavigationMenuItems();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);
  const store = useStore();
  const enterEditMode = () => {
    const currentNavigationMenuItems = store.get(
      navigationMenuItemsSelector.atom,
    );
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
      pageIcon: getIcon(item.icon ?? FOLDER_ICON_DEFAULT),
    });
    const firstChild = workspaceNavigationMenuItemsSorted.find((navItem) => {
      if (navItem.folderId !== folderId) return false;
      if (navItem.type === NavigationMenuItemType.LINK) return false;
      const link = getNavigationMenuItemComputedLink(
        navItem,
        objectMetadataItems,
        views,
      );
      return isNonEmptyString(link);
    });
    if (firstChild) {
      const link = getNavigationMenuItemComputedLink(
        firstChild,
        objectMetadataItems,
        views,
      );
      if (isNonEmptyString(link)) {
        navigate(link);
      }
    }
  };

  const openViewOrRecordEditPanelAndNavigate = (
    item: NavigationMenuItemClickParams['item'],
    objectMetadataItem: ObjectMetadataItem | null | undefined,
  ) => {
    if (objectMetadataItem) {
      const label =
        item.type === NavigationMenuItemType.VIEW ||
        item.type === NavigationMenuItemType.OBJECT
          ? getNavigationMenuItemLabel(item, objectMetadataItems, views)
          : objectMetadataItem.labelSingular;
      openNavigationMenuItemInSidePanel({
        pageTitle: label,
        pageIcon: getIcon(objectMetadataItem.icon),
      });
    }
    const link = getNavigationMenuItemComputedLink(
      item,
      objectMetadataItems,
      views,
    );
    if (isNonEmptyString(link)) {
      navigate(link);
    }
  };

  const handleNavigationMenuItemClick = (
    params: NavigationMenuItemClickParams,
  ) => {
    const { item, objectMetadataItem } = params;
    setSelectedNavigationMenuItemInEditMode(item.id);

    switch (item.type) {
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
