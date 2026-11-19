import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getWorkspaceSidebarRootSectionId = (
  navigationMenuItems: Pick<
    NavigationMenuItem,
    'id' | 'type' | 'parentId' | 'position'
  >[],
): string | null =>
  navigationMenuItems
    .filter(
      (item) =>
        item.type === NavigationMenuItemType.SECTION &&
        !isDefined(item.parentId),
    )
    .sort((a, b) => a.position - b.position)[0]?.id ?? null;
