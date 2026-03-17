import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { IconFolder, IconFolderPlus, IconHeartOff } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/common/constants/NavigationMenuItemDroppableIds';
import { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import { NavigationMenuItemDragContext } from '@/navigation-menu-item/common/contexts/NavigationMenuItemDragContext';
import { useDeleteNavigationMenuItem } from '@/navigation-menu-item/common/hooks/useDeleteNavigationMenuItem';
import { isNavigationMenuItemFolderCreatingState } from '@/navigation-menu-item/common/states/isNavigationMenuItemFolderCreatingState';
import { getDndKitDropTargetId } from '@/navigation-menu-item/common/utils/getDndKitDropTargetId';
import { getEffectiveNavigationMenuItemColor } from '@/navigation-menu-item/common/utils/getEffectiveNavigationMenuItemColor';
import { isLocationMatchingNavigationMenuItem } from '@/navigation-menu-item/common/utils/isLocationMatchingNavigationMenuItem';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { NavigationMenuItemIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemIcon';
import { NavigationItemDropTarget } from '@/navigation-menu-item/display/dnd/components/NavigationItemDropTarget';
import { NavigationMenuItemSortableItem } from '@/navigation-menu-item/display/dnd/components/NavigationMenuItemSortableItem';
import { NavigationMenuItemFolder } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolder';
import { useCreateNavigationMenuItemFolder } from '@/navigation-menu-item/display/folder/hooks/useCreateNavigationMenuItemFolder';
import { useNavigationMenuItemsByFolder } from '@/navigation-menu-item/display/folder/hooks/useNavigationMenuItemsByFolder';
import { useSortedNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useSortedNavigationMenuItems';
import { getNavigationMenuItemObjectNameSingular } from '@/navigation-menu-item/display/object/utils/getNavigationMenuItemObjectNameSingular';
import { getObjectNavigationMenuItemSecondaryLabel } from '@/navigation-menu-item/display/object/utils/getObjectNavigationMenuItemSecondaryLabel';
import { NavigationMenuItemSection } from '@/navigation-menu-item/display/sections/components/NavigationMenuItemSection';
import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/utils/getNavigationMenuItemComputedLink';
import { getNavigationMenuItemLabel } from '@/navigation-menu-item/display/utils/getNavigationMenuItemLabel';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerInput';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { isNavigationSectionOpenFamilyState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';

const StyledEmptyContainer = styled.div`
  width: 100%;
`;

const StyledOrphanItemContainer = styled.div`
  margin-bottom: ${themeCssVariables.betweenSiblingsGap};
`;

const ORPHAN_DROPPABLE_ID =
  NavigationMenuItemDroppableIds.ORPHAN_NAVIGATION_MENU_ITEMS;

export const FavoritesSection = () => {
  const { navigationMenuItemsSorted } = useSortedNavigationMenuItems();
  const { userNavigationMenuItemsByFolder } = useNavigationMenuItemsByFolder();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);
  const { deleteNavigationMenuItem } = useDeleteNavigationMenuItem();
  const { isDragging } = useContext(NavigationMenuItemDragContext);
  const currentPath = useLocation().pathname;
  const currentViewPath = useLocation().pathname + useLocation().search;

  const [newFolderName, setNewFolderName] = useState('');
  const { createNewNavigationMenuItemFolder } =
    useCreateNavigationMenuItemFolder();

  const [
    isNavigationMenuItemFolderCreating,
    setIsNavigationMenuItemFolderCreating,
  ] = useAtomState(isNavigationMenuItemFolderCreatingState);

  const { t } = useLingui();

  const { toggleNavigationSection, openNavigationSection } =
    useNavigationSection('Favorites');
  const isNavigationSectionOpen = useAtomFamilyStateValue(
    isNavigationSectionOpenFamilyState,
    'Favorites',
  );

  const topLevelItems = useMemo(
    () => navigationMenuItemsSorted.filter((item) => !item.folderId),
    [navigationMenuItemsSorted],
  );

  const folderChildrenMap = useMemo(() => {
    const map = new Map<
      string,
      (typeof userNavigationMenuItemsByFolder)[number]
    >();
    for (const folder of userNavigationMenuItemsByFolder) {
      map.set(folder.id, folder);
    }
    return map;
  }, [userNavigationMenuItemsByFolder]);

  const toggleNewFolder = () => {
    openNavigationSection();
    setIsNavigationMenuItemFolderCreating((current) => !current);
  };

  const handleSubmitFolderCreation = async (value: string) => {
    if (value === '') return;
    setIsNavigationMenuItemFolderCreating(false);
    setNewFolderName('');
    await createNewNavigationMenuItemFolder(value);
    return true;
  };

  const handleClickOutside = async (
    _event: MouseEvent | TouchEvent,
    value: string,
  ) => {
    if (!value) {
      setIsNavigationMenuItemFolderCreating(false);
      return;
    }
    setIsNavigationMenuItemFolderCreating(false);
    setNewFolderName('');
    await createNewNavigationMenuItemFolder(value);
  };

  const handleCancelFolderCreation = () => {
    setNewFolderName('');
    setIsNavigationMenuItemFolderCreating(false);
  };

  if (
    topLevelItems.length === 0 &&
    !isNavigationMenuItemFolderCreating &&
    userNavigationMenuItemsByFolder.length === 0
  ) {
    return null;
  }

  const hasFolders = userNavigationMenuItemsByFolder.length > 1;

  return (
    <NavigationMenuItemSection
      title={t`Favorites`}
      isOpen={isNavigationSectionOpen}
      onToggle={toggleNavigationSection}
      rightIcon={
        <LightIconButton
          Icon={IconFolderPlus}
          onClick={toggleNewFolder}
          accent="tertiary"
        />
      }
    >
      {isNavigationMenuItemFolderCreating && (
        <NavigationDrawerAnimatedCollapseWrapper>
          <NavigationDrawerInput
            Icon={IconFolder}
            value={newFolderName}
            onChange={setNewFolderName}
            onSubmit={handleSubmitFolderCreation}
            onCancel={handleCancelFolderCreation}
            onClickOutside={handleClickOutside}
          />
        </NavigationDrawerAnimatedCollapseWrapper>
      )}
      {topLevelItems.length > 0 ? (
        <>
          {topLevelItems.map((item, index) => {
            const dropIndicator = (
              <NavigationItemDropTarget
                folderId={null}
                index={index}
                sectionId={NavigationSections.FAVORITES}
                compact
                dropTargetIdOverride={getDndKitDropTargetId(
                  ORPHAN_DROPPABLE_ID,
                  index,
                )}
              />
            );

            if (isNavigationMenuItemFolder(item)) {
              const folderData = folderChildrenMap.get(item.id);
              return (
                <div key={item.id}>
                  {dropIndicator}
                  <NavigationMenuItemSortableItem
                    id={item.id}
                    index={index}
                    group={ORPHAN_DROPPABLE_ID}
                  >
                    <NavigationMenuItemFolder
                      folderId={item.id}
                      folderName={
                        folderData?.folderName ?? item.name ?? 'Folder'
                      }
                      navigationMenuItems={
                        folderData?.navigationMenuItems ?? []
                      }
                      section={NavigationSections.FAVORITES}
                      isGroup={hasFolders}
                    />
                  </NavigationMenuItemSortableItem>
                </div>
              );
            }

            const label = getNavigationMenuItemLabel(
              item,
              objectMetadataItems,
              views,
            );
            const computedLink = getNavigationMenuItemComputedLink(
              item,
              objectMetadataItems,
              views,
            );
            const objectNameSingular =
              getNavigationMenuItemObjectNameSingular(
                item,
                objectMetadataItems,
                views,
              );

            return (
              <div key={item.id}>
                {dropIndicator}
                <NavigationMenuItemSortableItem
                  id={item.id}
                  index={index}
                  group={ORPHAN_DROPPABLE_ID}
                >
                  <StyledOrphanItemContainer>
                    <NavigationDrawerItem
                      secondaryLabel={getObjectNavigationMenuItemSecondaryLabel(
                        {
                          objectMetadataItems,
                          navigationMenuItemObjectNameSingular:
                            objectNameSingular ?? '',
                        },
                      )}
                      label={label}
                      Icon={() => (
                        <NavigationMenuItemIcon navigationMenuItem={item} />
                      )}
                      iconColor={getEffectiveNavigationMenuItemColor(item)}
                      active={isLocationMatchingNavigationMenuItem(
                        currentPath,
                        currentViewPath,
                        item.type,
                        computedLink,
                      )}
                      to={isDragging ? undefined : computedLink}
                      rightOptions={
                        <LightIconButton
                          Icon={IconHeartOff}
                          onClick={(event) => {
                            event.stopPropagation();
                            deleteNavigationMenuItem(item.id);
                          }}
                          accent="tertiary"
                        />
                      }
                      isDragging={isDragging}
                      triggerEvent="CLICK"
                    />
                  </StyledOrphanItemContainer>
                </NavigationMenuItemSortableItem>
              </div>
            );
          })}
          <NavigationItemDropTarget
            folderId={null}
            index={topLevelItems.length}
            sectionId={NavigationSections.FAVORITES}
            compact
            dropTargetIdOverride={getDndKitDropTargetId(
              ORPHAN_DROPPABLE_ID,
              topLevelItems.length,
            )}
          />
        </>
      ) : (
        <StyledEmptyContainer
          style={{ height: isDragging ? '24px' : '1px' }}
        />
      )}
    </NavigationMenuItemSection>
  );
};
