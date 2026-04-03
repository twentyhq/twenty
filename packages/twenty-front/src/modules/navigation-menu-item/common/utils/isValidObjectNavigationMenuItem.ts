import { isNonEmptyString } from '@sniptt/guards';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { isNavigationMenuItemObject } from '@/navigation-menu-item/common/utils/isNavigationMenuItemObject';
import { isDefined } from 'twenty-shared/utils';

type ObjectNavigationMenuItem = Omit<
  NavigationMenuItem,
  'targetObjectMetadataId'
> & {
  targetObjectMetadataId: string;
};

export const isValidObjectNavigationMenuItem = (
  item?: NavigationMenuItem,
): item is ObjectNavigationMenuItem =>
  isDefined(item) &&
  isNavigationMenuItemObject(item) &&
  isNonEmptyString(item.targetObjectMetadataId);
