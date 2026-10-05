import { t } from '@lingui/core/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { LightIconButton } from 'twenty-ui/components';
import { IconHeartOff } from 'twenty-ui/icon';
import {
  FeatureFlagKey,
  type NavigationMenuItem,
} from '~/generated-metadata/graphql';

import { NavigationMenuItemDroppableIds } from '@/navigation-menu-item/common/constants/NavigationMenuItemDroppableIds';
import { useDeleteManyNavigationMenuItems } from '@/navigation-menu-item/common/hooks/useDeleteManyNavigationMenuItems';
import { NavigationMenuItemIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemIcon';
import { NavigationMenuItemSortableItem } from '@/navigation-menu-item/display/dnd/components/NavigationMenuItemSortableItem';
import { getNavigationMenuItemObjectNameSingular } from '@/navigation-menu-item/display/object/utils/getNavigationMenuItemObjectNameSingular';
import { getObjectNavigationMenuItemSecondaryLabel } from '@/navigation-menu-item/display/object/utils/getObjectNavigationMenuItemSecondaryLabel';
import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/utils/getNavigationMenuItemComputedLink';
import { getNavigationMenuItemLabel } from '@/navigation-menu-item/display/utils/getNavigationMenuItemLabel';
import { NavigationMenuItemBackButton } from '@/navigation-menu-item/edit/components/NavigationMenuItemBackButton';
import { lastVisitedViewPerObjectMetadataItemState } from '@/navigation/states/lastVisitedViewPerObjectMetadataItemState';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

type NavigationMenuItemFolderContentProps = {
  folderId: string;
  folderName: string;
  navigationMenuItems: NavigationMenuItem[];
};

export const NavigationMenuItemFolderContent = ({
  folderName,
  folderId,
  navigationMenuItems,
}: NavigationMenuItemFolderContentProps) => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);
  const lastVisitedViewPerObjectMetadataItem = useAtomStateValue(
    lastVisitedViewPerObjectMetadataItemState,
  );
  const isInitialObjectViewEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_INITIAL_OBJECT_VIEW_ENABLED,
  );
  const { deleteManyNavigationMenuItems } = useDeleteManyNavigationMenuItems();

  const folderDroppableId = `${NavigationMenuItemDroppableIds.FAVORITE_FOLDER_PREFIX}${folderId}`;

  return (
    <>
      <NavigationMenuItemBackButton folderName={folderName} />
      {navigationMenuItems.map((navigationMenuItem, index) => {
        const label = getNavigationMenuItemLabel(
          navigationMenuItem,
          objectMetadataItems,
          views,
        );
        const computedLink = getNavigationMenuItemComputedLink({
          item: navigationMenuItem,
          objectMetadataItems,
          views,
          lastVisitedViewPerObjectMetadataItem,
          isInitialObjectViewEnabled,
        });
        const objectNameSingular = getNavigationMenuItemObjectNameSingular(
          navigationMenuItem,
          objectMetadataItems,
          views,
        );

        return (
          <NavigationMenuItemSortableItem
            key={navigationMenuItem.id}
            id={navigationMenuItem.id}
            index={index}
            group={folderDroppableId}
          >
            <NavigationDrawerItem
              secondaryLabel={getObjectNavigationMenuItemSecondaryLabel({
                isView: navigationMenuItem.type === NavigationMenuItemType.VIEW,
                objectMetadataItems,
                navigationMenuItemObjectNameSingular: objectNameSingular ?? '',
              })}
              label={label}
              Icon={() => (
                <NavigationMenuItemIcon
                  navigationMenuItem={navigationMenuItem}
                />
              )}
              rightOptions={
                <LightIconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteManyNavigationMenuItems([navigationMenuItem.id]);
                  }}
                  emphasis="subtle"
                  aria-label={t`Remove from favorites`}
                >
                  <IconHeartOff />
                </LightIconButton>
              }
              triggerEvent="CLICK"
              to={computedLink}
            />
          </NavigationMenuItemSortableItem>
        );
      })}
    </>
  );
};
