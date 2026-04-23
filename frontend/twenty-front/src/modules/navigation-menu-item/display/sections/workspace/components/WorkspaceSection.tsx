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

import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { FOLDER_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/FolderIconDefault';
import { openNavigationMenuItemFolderIdsState } from '@/navigation-menu-item/common/states/openNavigationMenuItemFolderIdsState';
import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { preloadNavigationMenuItemDndKit } from '@/navigation-menu-item/display/dnd/preloadNavigationMenuItemDndKit';
import {
  type NavigationMenuItemClickParams,
  useNavigationMenuItemSectionItems,
} from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import { useSortedNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useSortedNavigationMenuItems';
import { WorkspaceSectionContainer } from '@/navigation-menu-item/display/sections/workspace/components/WorkspaceSectionContainer';
import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/utils/getNavigationMenuItemComputedLink';
import { getNavigationMenuItemLabel } from '@/navigation-menu-item/display/utils/getNavigationMenuItemLabel';
import { useOpenNavigationMenuItemInSidePanel } from '@/navigation-menu-item/edit/hooks/useOpenNavigationMenuItemInSidePanel';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { NavigationMenuItemType, SidePanelPages } from 'twenty-shared/types';

const StyledRightIconsContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

export const WorkspaceSection = () => {
  const items = useNavigationMenuItemSectionItems();
  const { workspaceNavigationMenuItemsSorted } = useSortedNavigationMenuItems();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);
  const { enterLayoutCustomizationMode } = useEnterLayoutCustomizationMode();
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const [
    selectedNavigationMenuItemIdInEditMode,
    setSelectedNavigationMenuItemIdInEditMode,
  ] = useAtomState(selectedNavigationMenuItemIdInEditModeState);
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
    enterLayoutCustomizationMode();
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
    objectMetadataItem: EnrichedObjectMetadataItem | null | undefined,
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
    setSelectedNavigationMenuItemIdInEditMode(item.id);

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
    objectMetadataItem: EnrichedObjectMetadataItem,
    navigationMenuItemId: string,
  ) => {
    enterLayoutCustomizationMode();
    setSelectedNavigationMenuItemIdInEditMode(navigationMenuItemId);
    openNavigationMenuItemInSidePanel({
      pageTitle: objectMetadataItem.labelSingular,
      pageIcon: getIcon(objectMetadataItem.icon),
    });
  };

  const handleAddMenuItem = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    navigateSidePanel({
      page: SidePanelPages.NavigationMenuAddItem,
      pageTitle: t`New menu item`,
      pageIcon: IconColumnInsertRight,
      resetNavigationStack: true,
    });
  };

  return (
    <WorkspaceSectionContainer
      sectionTitle={t`Workspace`}
      items={items}
      rightIcon={
        <StyledRightIconsContainer>
          {isLayoutCustomizationModeEnabled ? (
            <LightIconButton
              Icon={IconPlus}
              accent="tertiary"
              size="small"
              onClick={handleAddMenuItem}
            />
          ) : (
            <div onMouseEnter={preloadNavigationMenuItemDndKit}>
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
      selectedNavigationMenuItemId={selectedNavigationMenuItemIdInEditMode}
      onNavigationMenuItemClick={
        isLayoutCustomizationModeEnabled
          ? handleNavigationMenuItemClick
          : undefined
      }
      onActiveObjectMetadataItemClick={handleActiveObjectMetadataItemClick}
    />
  );
};
