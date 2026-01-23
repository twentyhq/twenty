import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ObjectRecordIdentifier } from '@/object-record/types/ObjectRecordIdentifier';
import { type View } from '@/views/types/View';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { getObjectMetadataNamePluralFromViewId } from '@/favorites/utils/getObjectMetadataNamePluralFromViewId';
import {
  computeNavigationMenuItemDisplayFields,
  type NavigationMenuItemDisplayFields,
} from './computeNavigationMenuItemDisplayFields';

export type ProcessedNavigationMenuItem = NavigationMenuItem &
  NavigationMenuItemDisplayFields;

export const sortNavigationMenuItems = (
  navigationMenuItems: NavigationMenuItem[],
  hasLinkToShowPage: boolean,
  views: Pick<View, 'id' | 'name' | 'objectMetadataId' | 'icon'>[],
  objectMetadataItems: ObjectMetadataItem[],
  targetRecordIdentifiers: Map<string, ObjectRecordIdentifier>,
): ProcessedNavigationMenuItem[] => {
  return navigationMenuItems
    .map((navigationMenuItem) => {
      if (isDefined(navigationMenuItem.viewId)) {
        const view = views.find(
          (view) => view.id === navigationMenuItem.viewId,
        );

        if (isDefined(view)) {
          const { namePlural } = getObjectMetadataNamePluralFromViewId(
            view,
            objectMetadataItems,
          );

          const displayFields: NavigationMenuItemDisplayFields = {
            labelIdentifier: view.name,
            avatarUrl: '',
            avatarType: 'icon',
            link: getAppPath(
              AppPath.RecordIndexPage,
              { objectNamePlural: namePlural },
              { viewId: navigationMenuItem.viewId },
            ),
            objectNameSingular: 'view',
            Icon: view.icon,
          };

          return {
            ...navigationMenuItem,
            ...displayFields,
          };
        }

        return null;
      }

      if (!isDefined(navigationMenuItem.targetRecordId)) {
        return null;
      }

      const objectMetadataItem = objectMetadataItems.find(
        (item) => item.id === navigationMenuItem.targetObjectMetadataId,
      );

      if (!isDefined(objectMetadataItem)) {
        return null;
      }

      const objectRecordIdentifier = targetRecordIdentifiers.get(
        navigationMenuItem.targetRecordId,
      );

      if (!isDefined(objectRecordIdentifier)) {
        return null;
      }

      const displayFields = computeNavigationMenuItemDisplayFields(
        objectMetadataItem,
        objectRecordIdentifier,
      );

      if (!isDefined(displayFields)) {
        return null;
      }

      return {
        ...navigationMenuItem,
        ...displayFields,
        link: hasLinkToShowPage ? displayFields.link : '',
      };
    })
    .filter(isDefined)
    .sort((a, b) => a.position - b.position);
};
