import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { NavigationMenuItemIcon } from '@/navigation-menu-item/components/NavigationMenuItemIcon';
import { type NavigationMenuItemClickParams } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/states/isNavigationMenuInEditModeState';
import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/utils/getNavigationMenuItemComputedLink';
import { getNavigationMenuItemLabel } from '@/navigation-menu-item/utils/getNavigationMenuItemLabel';
import { getNavigationMenuItemObjectNameSingular } from '@/navigation-menu-item/utils/getNavigationMenuItemObjectNameSingular';
import { getNavigationMenuItemSecondaryLabel } from '@/navigation-menu-item/utils/getNavigationMenuItemSecondaryLabel';
import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/utils/getObjectMetadataForNavigationMenuItem';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { ViewKey } from '@/views/types/ViewKey';

type WorkspaceNavigationMenuItemFolderSubItemProps = {
  navigationMenuItem: NavigationMenuItem;
  index: number;
  arrayLength: number;
  selectedNavigationMenuItemIndex: number;
  onNavigationMenuItemClick?: (params: NavigationMenuItemClickParams) => void;
  selectedNavigationMenuItemId: string | null;
  isContextDragging: boolean;
};

export const WorkspaceNavigationMenuItemFolderSubItem = ({
  navigationMenuItem,
  index,
  arrayLength,
  selectedNavigationMenuItemIndex,
  onNavigationMenuItemClick,
  selectedNavigationMenuItemId,
  isContextDragging,
}: WorkspaceNavigationMenuItemFolderSubItemProps) => {
  const isNavigationMenuInEditMode = useAtomStateValue(
    isNavigationMenuInEditModeState,
  );
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);

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
    ? views.find((view) => view.id === navigationMenuItem.viewId)
    : undefined;
  const isIndexView = view?.key === ViewKey.INDEX;

  return (
    <NavigationDrawerSubItem
      secondaryLabel={
        isIndexView
          ? undefined
          : getNavigationMenuItemSecondaryLabel({
              objectMetadataItems,
              navigationMenuItemObjectNameSingular: objectNameSingular ?? '',
            })
      }
      label={label}
      Icon={() => (
        <NavigationMenuItemIcon navigationMenuItem={navigationMenuItem} />
      )}
      to={isContextDragging || handleEditModeClick ? undefined : computedLink}
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
      isDragging={isContextDragging}
      triggerEvent="CLICK"
    />
  );
};
