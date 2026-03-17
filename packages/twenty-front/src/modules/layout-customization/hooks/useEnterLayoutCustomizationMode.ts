import { activeCustomizationPageLayoutIdsState } from '@/layout-customization/states/activeCustomizationPageLayoutIdsState';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { filterWorkspaceNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterWorkspaceNavigationMenuItems';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/common/states/navigationMenuItemsDraftState';
import { navigationMenuItemsSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsSelector';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useEnterLayoutCustomizationMode = () => {
  const store = useStore();

  const enterLayoutCustomizationMode = useCallback(() => {
    const isLayoutCustomizationModeAlreadyEnabled = store.get(
      isLayoutCustomizationModeEnabledState.atom,
    );

    if (isLayoutCustomizationModeAlreadyEnabled) {
      return;
    }

    const prefetchNavigationMenuItems = store.get(
      navigationMenuItemsSelector.atom,
    );
    const workspaceNavigationMenuItems = filterWorkspaceNavigationMenuItems(
      prefetchNavigationMenuItems,
    );

    const objectMetadataItems = store.get(objectMetadataItemsSelector.atom);
    const objectMetadataColorById = new Map(
      objectMetadataItems.map((item) => [item.id, item.color]),
    );

    const draftWithResolvedColors = workspaceNavigationMenuItems.map(
      (item) => {
        if (
          item.type !== NavigationMenuItemType.OBJECT &&
          item.type !== NavigationMenuItemType.VIEW
        ) {
          return item;
        }

        if (!isDefined(item.targetObjectMetadataId)) {
          return item;
        }

        const objectColor = objectMetadataColorById.get(
          item.targetObjectMetadataId,
        );

        if (!isDefined(objectColor) || objectColor === item.color) {
          return item;
        }

        return { ...item, color: objectColor };
      },
    );

    store.set(navigationMenuItemsDraftState.atom, draftWithResolvedColors);

    store.set(activeCustomizationPageLayoutIdsState.atom, []);

    store.set(isLayoutCustomizationModeEnabledState.atom, true);
  }, [store]);

  return { enterLayoutCustomizationMode };
};
