import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import {
  IconColumnInsertRight,
  IconLink,
  IconPlus,
  IconTool,
  useIcons,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { FOLDER_ICON_DEFAULT } from '@/navigation-menu-item/constants/FolderIconDefault';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { useOpenNavigationMenuItemInSidePanel } from '@/navigation-menu-item/hooks/useOpenNavigationMenuItemInSidePanel';
import {
  type NavigationMenuItemClickParams,
  useWorkspaceSectionItems,
} from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/states/isNavigationMenuInEditModeState';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { openNavigationMenuItemFolderIdsState } from '@/navigation-menu-item/states/openNavigationMenuItemFolderIdsState';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/utils/filterWorkspaceNavigationMenuItems';
import { NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader';
import { NavigationDrawerSectionForWorkspaceItems } from '@/object-metadata/components/NavigationDrawerSectionForWorkspaceItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { prefetchNavigationMenuItemsState } from '@/prefetch/states/prefetchNavigationMenuItemsState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useStore } from 'jotai';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const StyledRightIconsContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

export const WorkspaceNavigationMenuItems = () => {
  const items = useWorkspaceSectionItems();
  const store = useStore();
  const enterEditMode = () => {
    const prefetchNavigationMenuItems = store.get(
      prefetchNavigationMenuItemsState.atom,
    );
    const workspaceNavigationMenuItems = filterWorkspaceNavigationMenuItems(
      prefetchNavigationMenuItems,
    );
    store.set(navigationMenuItemsDraftState.atom, workspaceNavigationMenuItems);
    store.set(isNavigationMenuInEditModeState.atom, true);
  };
  const isNavigationMenuItemEditingEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_EDITING_ENABLED,
  );
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
  const { navigateSidePanel } = useNavigateSidePanel();
  const { openNavigationMenuItemInSidePanel } =
    useOpenNavigationMenuItemInSidePanel();
  const { getIcon } = useIcons();

  const loading = useIsPrefetchLoading();
  const { t } = useLingui();

  const handleEditClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    enterEditMode();
  };

  const handleNavigationMenuItemClick = (
    params: NavigationMenuItemClickParams,
  ) => {
    const { item, objectMetadataItem } = params;
    const id = item.id;
    setSelectedNavigationMenuItemInEditMode(id);
    if (item.itemType === NavigationMenuItemType.FOLDER) {
      setOpenNavigationMenuItemFolderIds((currentOpenFolders) =>
        currentOpenFolders.includes(id)
          ? currentOpenFolders
          : [...currentOpenFolders, id],
      );
      openNavigationMenuItemInSidePanel({
        pageTitle: t`Edit folder`,
        pageIcon: getIcon(item.icon ?? item.Icon ?? FOLDER_ICON_DEFAULT),
      });
    } else if (item.itemType === NavigationMenuItemType.LINK) {
      openNavigationMenuItemInSidePanel({
        pageTitle: t`Edit link`,
        pageIcon: IconLink,
      });
    } else if (isDefined(objectMetadataItem)) {
      const pageTitle =
        item.itemType === NavigationMenuItemType.VIEW
          ? item.labelIdentifier
          : objectMetadataItem.labelSingular;
      openNavigationMenuItemInSidePanel({
        pageTitle,
        pageIcon: getIcon(objectMetadataItem.icon),
      });
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

  const isEditMode =
    isNavigationMenuItemEditingEnabled && isNavigationMenuInEditMode;

  if (loading) {
    return <NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader />;
  }

  return (
    <NavigationDrawerSectionForWorkspaceItems
      sectionTitle={t`Workspace`}
      items={items}
      rightIcon={
        isNavigationMenuItemEditingEnabled ? (
          <StyledRightIconsContainer>
            {isEditMode ? (
              <LightIconButton
                Icon={IconPlus}
                accent="tertiary"
                size="small"
                onClick={handleAddMenuItem}
              />
            ) : (
              <LightIconButton
                Icon={IconTool}
                accent="tertiary"
                size="small"
                onClick={handleEditClick}
              />
            )}
          </StyledRightIconsContainer>
        ) : undefined
      }
      onAddMenuItem={
        isNavigationMenuItemEditingEnabled && isEditMode
          ? handleAddMenuItem
          : undefined
      }
      isEditMode={isEditMode}
      selectedNavigationMenuItemId={selectedNavigationMenuItemInEditMode}
      onNavigationMenuItemClick={
        isEditMode ? handleNavigationMenuItemClick : undefined
      }
      onActiveObjectMetadataItemClick={
        isNavigationMenuItemEditingEnabled
          ? handleActiveObjectMetadataItemClick
          : undefined
      }
    />
  );
};
