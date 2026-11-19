import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type NavigationMenuItem } from '~/generated-metadata/graphql';

// TODO(@thomtrp): remove once IS_CUSTOMIZABLE_SIDEBAR_ENABLED is on for every workspace
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
