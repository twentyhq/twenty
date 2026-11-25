import { isDefined } from 'twenty-shared/utils';

import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const hasFavoriteNavigationMenuItems = (
  favoriteNavigationMenuItems: Pick<NavigationMenuItem, 'parentId'>[],
) => favoriteNavigationMenuItems.some((item) => !isDefined(item.parentId));
