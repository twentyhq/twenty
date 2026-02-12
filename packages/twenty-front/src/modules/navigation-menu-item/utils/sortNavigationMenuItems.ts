import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ObjectRecordIdentifier } from '@/object-record/types/ObjectRecordIdentifier';
import { type View } from '@/views/types/View';
import { ViewKey } from '@/views/types/ViewKey';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { getObjectMetadataNamePluralFromViewId } from '@/favorites/utils/getObjectMetadataNamePluralFromViewId';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { type ProcessedNavigationMenuItem } from '@/navigation-menu-item/types/processed-navigation-menu-item';
import {
  computeNavigationMenuItemDisplayFields,
  type NavigationMenuItemDisplayFields,
} from './computeNavigationMenuItemDisplayFields';
import { isNavigationMenuItemLink } from './isNavigationMenuItemLink';

export { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
export type { ProcessedNavigationMenuItem } from '@/navigation-menu-item/types/processed-navigation-menu-item';

export const sortNavigationMenuItems = (
  navigationMenuItems: NavigationMenuItem[],
  hasLinkToShowPage: boolean,
  views: Pick<View, 'id' | 'name' | 'objectMetadataId' | 'icon' | 'key'>[],
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
          const objectMetadataItem = objectMetadataItems.find(
            (meta) => meta.id === view.objectMetadataId,
          );
          const isIndexView = view.key === ViewKey.Index;
          const labelIdentifier =
            isIndexView && isDefined(objectMetadataItem)
              ? objectMetadataItem.labelPlural
              : view.name;
          const icon =
            isIndexView &&
            isDefined(objectMetadataItem) &&
            isDefined(objectMetadataItem.icon)
              ? objectMetadataItem.icon
              : view.icon;

          const displayFields: NavigationMenuItemDisplayFields = {
            labelIdentifier,
            avatarUrl: '',
            avatarType: 'icon',
            link: getAppPath(
              AppPath.RecordIndexPage,
              { objectNamePlural: namePlural },
              { viewId: navigationMenuItem.viewId },
            ),
            objectNameSingular: objectMetadataItem?.nameSingular ?? 'view',
            Icon: icon,
          };

          return {
            ...navigationMenuItem,
            ...displayFields,
            viewKey: view.key,
            itemType: NavigationMenuItemType.VIEW,
          };
        }

        return null;
      }

      if (isNavigationMenuItemLink(navigationMenuItem)) {
        const linkUrl = (navigationMenuItem.link ?? '').trim();
        const normalizedLink =
          linkUrl.startsWith('http://') || linkUrl.startsWith('https://')
            ? linkUrl
            : `https://${linkUrl}`;
        const displayFields: NavigationMenuItemDisplayFields = {
          labelIdentifier: (navigationMenuItem.name ?? linkUrl) || 'Link',
          avatarUrl: '',
          avatarType: 'icon',
          link: normalizedLink,
          objectNameSingular: 'link',
          Icon: 'IconLink',
        };
        return {
          ...navigationMenuItem,
          ...displayFields,
          itemType: NavigationMenuItemType.LINK,
        };
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
        itemType: NavigationMenuItemType.RECORD,
      };
    })
    .filter(isDefined)
    .sort((a, b) => a.position - b.position);
};
