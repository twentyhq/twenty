import { NavigationMenuItemType } from 'twenty-shared/types';

import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const canAddBuiltInSectionToContainer = ({
  type,
  containerId,
  items,
}: {
  type: NavigationMenuItemType;
  containerId: string | null;
  items: Pick<NavigationMenuItem, 'type' | 'parentId'>[];
}) =>
  !(type === NavigationMenuItemType.FAVORITES && containerId === null) &&
  !items.some(
    (item) => item.type === type && (item.parentId ?? null) === containerId,
  );
