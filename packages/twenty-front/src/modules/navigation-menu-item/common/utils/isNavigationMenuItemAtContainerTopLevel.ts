import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const isNavigationMenuItemAtContainerTopLevel = ({
  item,
  items,
}: {
  item: Pick<NavigationMenuItem, 'parentId'>;
  items: Pick<NavigationMenuItem, 'id' | 'type'>[];
}): boolean =>
  !isDefined(item.parentId) ||
  items.find((candidate) => candidate.id === item.parentId)?.type ===
    NavigationMenuItemType.TAB;
