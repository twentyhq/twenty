import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useContext, useMemo, useState } from 'react';
import { IconFolder, IconFolderPlus, IconHeartOff } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/common/constants/NavigationMenuItemDroppableIds';
import { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import { NavigationMenuItemDragContext } from '@/navigation-menu-item/common/contexts/NavigationMenuItemDragContext';
import { useDeleteManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useDeleteManyNavigationMenuItems';
import { isNavigationMenuItemFolderCreatingState } from '@/navigation-menu-item/common/states/isNavigationMenuItemFolderCreatingState';
import { isNavigationMenuItemFolder } from '@/navigation-menu-item/common/utils/isNavigationMenuItemFolder';
import { NavigationMenuItemDisplay } from '@/navigation-menu-item/display/components/NavigationMenuItemDisplay';
import { NavigationMenuItemDroppableSlot } from '@/navigation-menu-item/display/dnd/components/NavigationMenuItemDroppableSlot';
import { NavigationMenuItemSortableItem } from '@/navigation-menu-item/display/dnd/components/NavigationMenuItemSortableItem';
import { useIsDropDisabledForSection } from '@/navigation-menu-item/display/dnd/hooks/useIsDropDisabledForSection';
import { useCreateNavigationMenuItemFolder } from '@/navigation-menu-item/display/folder/hooks/useCreateNavigationMenuItemFolder';
import { useNavigationMenuItemsByFolder } from '@/navigation-menu-item/display/folder/hooks/useNavigationMenuItemsByFolder';
import { useSortedNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useSortedNavigationMenuItems';
import { NavigationMenuItemOrphanDropTarget } from '@/navigation-menu-item/display/sections/components/NavigationMenuItemOrphanDropTarget';
import { NavigationMenuItemSection } from '@/navigation-menu-item/display/sections/components/NavigationMenuItemSection';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerInput } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerInput';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { isNavigationSectionOpenFamilyState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.betweenSiblingsGap};
  padding-top: ${themeCssVariables.betweenSiblingsGap};
`;

const StyledListItemRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const StyledEmptyContainer = styled.div`
  width: 100%;
`;

const ORPHAN_DROPPABLE_ID =
  NavigationMenuItemDroppableIds.FAVORITE_ORPHAN_NAVIGATION_MENU_ITEMS;

export const FavoritesSection = () => {
  const { navigationMenuItemsSorted } = useSortedNavigationMenuItems();
  const { userNavigationMenuItemsByFolder } = useNavigationMenuItemsByFolder();
  const { deleteManyNavigationMenuItems } = useDeleteManyNavigationMenuItems();
  const { isDragging } = useContext(NavigationMenuItemDragContext);
  const favoritesDropDisabled = useIsDropDisabledForSection(false);

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

  const folderChildrenById = useMemo(() => {
    const map = new Map<string, NavigationMenuItem[]>();
    for (const folder of userNavigationMenuItemsByFolder) {
      map.set(folder.id, folder.navigationMenuItems);
    }
    return map;
  }, [userNavigationMenuItemsByFolder]);

  const folderCount = useMemo(
    () => topLevelItems.filter(isNavigationMenuItemFolder).length,
    [topLevelItems],
  );

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

  const makeRightOptions = useCallback(
    (item: NavigationMenuItem) => (
      <LightIconButton
        Icon={IconHeartOff}
        onClick={(event) => {
          event.stopPropagation();
          deleteManyNavigationMenuItems([item.id]);
        }}
        accent="tertiary"
      />
    ),
    [deleteManyNavigationMenuItems],
  );

  if (
    topLevelItems.length === 0 &&
    !isNavigationMenuItemFolderCreating &&
    userNavigationMenuItemsByFolder.length === 0
  ) {
    return null;
  }

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
        <StyledList>
          {topLevelItems.map((item, index) => (
            <StyledListItemRow key={item.id}>
              {index === 0 ? (
                <NavigationMenuItemDroppableSlot
                  droppableId={ORPHAN_DROPPABLE_ID}
                  index={0}
                  disabled={favoritesDropDisabled}
                >
                  <NavigationMenuItemOrphanDropTarget
                    index={0}
                    compact
                    sectionId={NavigationSections.FAVORITES}
                    droppableId={ORPHAN_DROPPABLE_ID}
                  />
                </NavigationMenuItemDroppableSlot>
              ) : (
                <NavigationMenuItemOrphanDropTarget
                  index={index}
                  compact
                  sectionId={NavigationSections.FAVORITES}
                  droppableId={ORPHAN_DROPPABLE_ID}
                />
              )}
              <NavigationMenuItemSortableItem
                id={item.id}
                index={index}
                group={ORPHAN_DROPPABLE_ID}
                disabled={favoritesDropDisabled}
              >
                <NavigationMenuItemDisplay
                  item={item}
                  isEditInPlace={isNavigationMenuItemFolder(item)}
                  isDragging={isDragging}
                  folderChildrenById={folderChildrenById}
                  folderCount={folderCount}
                  rightOptions={
                    isNavigationMenuItemFolder(item)
                      ? undefined
                      : makeRightOptions(item)
                  }
                />
              </NavigationMenuItemSortableItem>
            </StyledListItemRow>
          ))}
          <NavigationMenuItemDroppableSlot
            droppableId={ORPHAN_DROPPABLE_ID}
            index={topLevelItems.length}
            disabled={favoritesDropDisabled}
          >
            <NavigationMenuItemOrphanDropTarget
              index={topLevelItems.length}
              compact
              sectionId={NavigationSections.FAVORITES}
              droppableId={ORPHAN_DROPPABLE_ID}
            />
          </NavigationMenuItemDroppableSlot>
        </StyledList>
      ) : (
        <StyledEmptyContainer style={{ height: isDragging ? '24px' : '1px' }} />
      )}
    </NavigationMenuItemSection>
  );
};
