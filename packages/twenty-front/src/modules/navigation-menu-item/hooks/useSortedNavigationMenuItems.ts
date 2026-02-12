import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

import { isNavigationMenuItemFolder } from '@/navigation-menu-item/utils/isNavigationMenuItemFolder';
import { isNavigationMenuItemLink } from '@/navigation-menu-item/utils/isNavigationMenuItemLink';
import { recordIdentifierToObjectRecordIdentifier } from '@/navigation-menu-item/utils/recordIdentifierToObjectRecordIdentifier';
import { sortNavigationMenuItems } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectRecordIdentifier } from '@/object-record/types/ObjectRecordIdentifier';
import { coreViewsState } from '@/views/states/coreViewState';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';

import { usePrefetchedNavigationMenuItemsData } from './usePrefetchedNavigationMenuItemsData';

export const useSortedNavigationMenuItems = () => {
  const { navigationMenuItems, workspaceNavigationMenuItems } =
    usePrefetchedNavigationMenuItemsData();
  const coreViews = useRecoilValue(coreViewsState).map(convertCoreViewToView);
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const targetRecordIdentifiers = useMemo(() => {
    const identifiersMap = new Map<string, ObjectRecordIdentifier>();

    [...navigationMenuItems, ...workspaceNavigationMenuItems].forEach(
      (navigationMenuItem) => {
        if (isDefined(navigationMenuItem.viewId)) {
          return;
        }

        const itemTargetRecordId = navigationMenuItem.targetRecordId;
        if (!isDefined(itemTargetRecordId)) {
          return;
        }

        const targetRecordIdentifier =
          navigationMenuItem.targetRecordIdentifier;
        if (!isDefined(targetRecordIdentifier)) {
          return;
        }

        const objectMetadataItem = objectMetadataItems.find(
          (item) => item.id === navigationMenuItem.targetObjectMetadataId,
        );

        if (!isDefined(objectMetadataItem)) {
          return;
        }

        const objectRecordIdentifier = recordIdentifierToObjectRecordIdentifier(
          {
            recordIdentifier: targetRecordIdentifier,
            objectMetadataItem,
          },
        );

        identifiersMap.set(itemTargetRecordId, objectRecordIdentifier);
      },
    );

    return identifiersMap;
  }, [navigationMenuItems, workspaceNavigationMenuItems, objectMetadataItems]);

  const navigationMenuItemsSorted = useMemo(() => {
    return sortNavigationMenuItems(
      navigationMenuItems,
      true,
      coreViews,
      objectMetadataItems,
      targetRecordIdentifiers,
    );
  }, [
    navigationMenuItems,
    coreViews,
    objectMetadataItems,
    targetRecordIdentifiers,
  ]);

  const workspaceNavigationMenuItemsSorted = useMemo(() => {
    const filtered = workspaceNavigationMenuItems.filter((item) => {
      if (isNavigationMenuItemFolder(item)) {
        return true;
      }
      if (isNavigationMenuItemLink(item)) {
        return true;
      }
      if (isDefined(item.viewId)) {
        return coreViews.some((view) => view.id === item.viewId);
      }

      const itemTargetRecordId = item.targetRecordId;
      if (!isDefined(itemTargetRecordId)) {
        return false;
      }
      const matchesTargetRecord =
        targetRecordIdentifiers.has(itemTargetRecordId);
      return matchesTargetRecord;
    });
    return sortNavigationMenuItems(
      filtered,
      true,
      coreViews,
      objectMetadataItems,
      targetRecordIdentifiers,
    );
  }, [
    workspaceNavigationMenuItems,
    coreViews,
    objectMetadataItems,
    targetRecordIdentifiers,
  ]);

  return {
    navigationMenuItemsSorted,
    workspaceNavigationMenuItemsSorted,
  };
};
