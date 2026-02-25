import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useNavigate } from 'react-router-dom';
import { IconLink, IconPlus, IconTool, useIcons } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { FOLDER_ICON_DEFAULT } from '@/navigation-menu-item/constants/FolderIconDefault';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { useOpenNavigationMenuItemInCommandMenu } from '@/navigation-menu-item/hooks/useOpenNavigationMenuItemInCommandMenu';
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
import { useStore } from 'jotai';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { isNonEmptyString } from '@sniptt/guards';
import { CommandMenuPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const StyledRightIconsContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
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
  const navigate = useNavigate();
  const { navigateCommandMenu } = useNavigateCommandMenu();
  const { openNavigationMenuItemInCommandMenu } =
    useOpenNavigationMenuItemInCommandMenu();
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
      openNavigationMenuItemInCommandMenu({
        pageTitle: t`Edit folder`,
        pageIcon: getIcon(item.icon ?? item.Icon ?? FOLDER_ICON_DEFAULT),
      });
    } else if (item.itemType === NavigationMenuItemType.LINK) {
      openNavigationMenuItemInCommandMenu({
        pageTitle: t`Edit link`,
        pageIcon: IconLink,
      });
    } else if (isDefined(objectMetadataItem)) {
      openNavigationMenuItemInCommandMenu({
        pageTitle: objectMetadataItem.labelPlural,
        pageIcon: getIcon(objectMetadataItem.icon),
      });

      if (isNonEmptyString(item.link)) {
        navigate(item.link);
      }
    }
  };

  const handleActiveObjectMetadataItemClick = (
    objectMetadataItem: ObjectMetadataItem,
    navigationMenuItemId: string,
  ) => {
    enterEditMode();
    setSelectedNavigationMenuItemInEditMode(navigationMenuItemId);
    openNavigationMenuItemInCommandMenu({
      pageTitle: objectMetadataItem.labelPlural,
      pageIcon: getIcon(objectMetadataItem.icon),
    });
  };

  const handleAddMenuItem = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    navigateCommandMenu({
      page: CommandMenuPages.NavigationMenuAddItem,
      pageTitle: t`New sidebar item`,
      pageIcon: IconPlus,
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
