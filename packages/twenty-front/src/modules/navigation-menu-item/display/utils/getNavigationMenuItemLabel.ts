import { i18n } from '@lingui/core';
import { isNonEmptyString } from '@sniptt/guards';

import { getFolderNavigationMenuItemLabel } from '@/navigation-menu-item/display/folder/utils/getFolderNavigationMenuItemLabel';
import { getLinkNavigationMenuItemLabel } from '@/navigation-menu-item/display/link/utils/getLinkNavigationMenuItemLabel';
import { getObjectNavigationMenuItemLabel } from '@/navigation-menu-item/display/object/utils/getObjectNavigationMenuItemLabel';
import { getSystemPageNavigationMenuItemConfig } from '@/navigation-menu-item/display/system-page/utils/getSystemPageNavigationMenuItemConfig';
import { getRecordNavigationMenuItemLabel } from '@/navigation-menu-item/display/record/utils/getRecordNavigationMenuItemLabel';
import { getViewNavigationMenuItemLabel } from '@/navigation-menu-item/display/view/utils/getViewNavigationMenuItemLabel';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type View } from '@/views/types/View';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getNavigationMenuItemLabel = (
  item: NavigationMenuItem,
  objectMetadataItems: Pick<
    EnrichedObjectMetadataItem,
    'id' | 'labelPlural' | 'nameSingular'
  >[],
  views: Pick<View, 'id' | 'name' | 'objectMetadataId' | 'key'>[],
): string => {
  switch (item.type) {
    case NavigationMenuItemType.OBJECT:
      return getObjectNavigationMenuItemLabel(item, objectMetadataItems);
    case NavigationMenuItemType.VIEW:
      return getViewNavigationMenuItemLabel(item, views);
    case NavigationMenuItemType.LINK:
      return getLinkNavigationMenuItemLabel(item);
    case NavigationMenuItemType.RECORD:
      return getRecordNavigationMenuItemLabel(item);
    case NavigationMenuItemType.FOLDER:
      return getFolderNavigationMenuItemLabel(item);
    case NavigationMenuItemType.SYSTEM_PAGE: {
      const trimmedName = item.name?.trim();

      if (isNonEmptyString(trimmedName)) {
        return trimmedName;
      }

      const systemPageLabel =
        getSystemPageNavigationMenuItemConfig(item)?.label;

      return isDefined(systemPageLabel) ? i18n._(systemPageLabel) : '';
    }
    default:
      return item.name ?? '';
  }
};
