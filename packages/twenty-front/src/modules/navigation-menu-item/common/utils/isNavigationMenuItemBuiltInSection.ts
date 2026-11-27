import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const isNavigationMenuItemBuiltInSection = (
  item: Pick<NavigationMenuItem, 'type' | 'builtInSectionKey'>,
) =>
  item.type === NavigationMenuItemType.SECTION &&
  isDefined(item.builtInSectionKey);
