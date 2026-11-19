import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type NavigationMenuItem } from '~/generated-metadata/graphql';

// Temporary: the legacy sidebar (customizable sidebar flag off) has no sections, so it uses the
// standard Workspace section as its root. Remove with IS_CUSTOMIZABLE_SIDEBAR_ENABLED.
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
