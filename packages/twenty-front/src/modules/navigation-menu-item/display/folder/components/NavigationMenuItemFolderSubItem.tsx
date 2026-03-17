import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconHeartOff } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { NavigationSections } from '@/navigation-menu-item/common/constants/NavigationSections.constants';
import { useDeleteNavigationMenuItem } from '@/navigation-menu-item/common/hooks/useDeleteNavigationMenuItem';
import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/common/states/isNavigationMenuInEditModeState';
import { getEffectiveNavigationMenuItemColor } from '@/navigation-menu-item/common/utils/getEffectiveNavigationMenuItemColor';
import { NavigationMenuItemIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemIcon';
import { type NavigationMenuItemClickParams } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/display/object/utils/getObjectMetadataForNavigationMenuItem';
import { getNavigationMenuItemObjectNameSingular } from '@/navigation-menu-item/display/object/utils/getNavigationMenuItemObjectNameSingular';
import { getObjectNavigationMenuItemSecondaryLabel } from '@/navigation-menu-item/display/object/utils/getObjectNavigationMenuItemSecondaryLabel';
import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/utils/getNavigationMenuItemComputedLink';
import { getNavigationMenuItemLabel } from '@/navigation-menu-item/display/utils/getNavigationMenuItemLabel';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { ViewKey } from '@/views/types/ViewKey';

type NavigationMenuItemFolderSubItemProps = {
  section: NavigationSections;
  navigationMenuItem: NavigationMenuItem;
  index: number;
  arrayLength: number;
  selectedNavigationMenuItemIndex: number;
  isDragging: boolean;
  onNavigationMenuItemClick?: (params: NavigationMenuItemClickParams) => void;
  selectedNavigationMenuItemId?: string | null;
};

export const NavigationMenuItemFolderSubItem = ({
  section,
  navigationMenuItem,
  index,
  arrayLength,
  selectedNavigationMenuItemIndex,
  isDragging,
  onNavigationMenuItemClick,
  selectedNavigationMenuItemId,
}: NavigationMenuItemFolderSubItemProps) => {
  const isNavigationMenuInEditMode = useAtomStateValue(
    isNavigationMenuInEditModeState,
  );
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);
  const { deleteNavigationMenuItem } = useDeleteNavigationMenuItem();

  const isFavoritesSection = section === NavigationSections.FAVORITES;

  const label = getNavigationMenuItemLabel(
    navigationMenuItem,
    objectMetadataItems,
    views,
  );
  const computedLink = getNavigationMenuItemComputedLink(
    navigationMenuItem,
    objectMetadataItems,
    views,
  );
  const objectNameSingular = getNavigationMenuItemObjectNameSingular(
    navigationMenuItem,
    objectMetadataItems,
    views,
  );

  const view = isDefined(navigationMenuItem.viewId)
    ? views.find((viewItem) => viewItem.id === navigationMenuItem.viewId)
    : undefined;
  const isIndexView = view?.key === ViewKey.INDEX;

  const objectMetadataItem =
    navigationMenuItem.type === NavigationMenuItemType.OBJECT ||
    navigationMenuItem.type === NavigationMenuItemType.VIEW ||
    navigationMenuItem.type === NavigationMenuItemType.RECORD
      ? getObjectMetadataForNavigationMenuItem(
          navigationMenuItem,
          objectMetadataItems,
          views,
        )
      : null;

  const isEditableInEditMode =
    !isFavoritesSection &&
    isNavigationMenuInEditMode &&
    isDefined(onNavigationMenuItemClick) &&
    (navigationMenuItem.type === NavigationMenuItemType.LINK ||
      isDefined(objectMetadataItem));

  const handleEditModeClick =
    isEditableInEditMode && isDefined(onNavigationMenuItemClick)
      ? () =>
          onNavigationMenuItemClick({
            item: navigationMenuItem,
            objectMetadataItem: objectMetadataItem ?? undefined,
          })
      : undefined;

  const rightOptions = isFavoritesSection ? (
    <LightIconButton
      Icon={IconHeartOff}
      onClick={(event) => {
        event.stopPropagation();
        deleteNavigationMenuItem(navigationMenuItem.id);
      }}
      accent="tertiary"
    />
  ) : undefined;

  return (
    <NavigationDrawerSubItem
      secondaryLabel={
        isIndexView
          ? undefined
          : getObjectNavigationMenuItemSecondaryLabel({
              objectMetadataItems,
              navigationMenuItemObjectNameSingular: objectNameSingular ?? '',
            })
      }
      label={label}
      Icon={() => (
        <NavigationMenuItemIcon navigationMenuItem={navigationMenuItem} />
      )}
      iconColor={getEffectiveNavigationMenuItemColor(navigationMenuItem)}
      to={isDragging || handleEditModeClick ? undefined : computedLink}
      onClick={handleEditModeClick}
      active={index === selectedNavigationMenuItemIndex}
      isSelectedInEditMode={
        selectedNavigationMenuItemId === navigationMenuItem.id
      }
      subItemState={getNavigationSubItemLeftAdornment({
        index,
        arrayLength,
        selectedIndex: selectedNavigationMenuItemIndex,
      })}
      rightOptions={rightOptions}
      isDragging={isDragging}
      triggerEvent="CLICK"
    />
  );
};
