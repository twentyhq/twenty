import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getWorkspaceSidebarRootSectionId = ({
  navigationMenuItems,
  standardApplicationId,
}: {
  navigationMenuItems: Pick<
    NavigationMenuItem,
    'id' | 'type' | 'parentId' | 'applicationId'
  >[];
  standardApplicationId: string | undefined;
}): string | null =>
  navigationMenuItems.find(
    (item) =>
      isDefined(standardApplicationId) &&
      item.type === NavigationMenuItemType.SECTION &&
      !isDefined(item.parentId) &&
      item.applicationId === standardApplicationId,
  )?.id ?? null;
