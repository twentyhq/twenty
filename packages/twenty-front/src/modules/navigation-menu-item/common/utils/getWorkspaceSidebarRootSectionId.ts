import { STANDARD_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type NavigationMenuItem } from '~/generated-metadata/graphql';

// TODO(@thomtrp): remove once IS_CUSTOMIZABLE_SIDEBAR_ENABLED is on for every workspace
export const getWorkspaceSidebarRootSectionId = (
  navigationMenuItems: Pick<
    NavigationMenuItem,
    'id' | 'parentId' | 'universalIdentifier'
  >[],
): string | null =>
  navigationMenuItems.find(
    (item) =>
      !isDefined(item.parentId) &&
      item.universalIdentifier ===
        STANDARD_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIERS.workspaceSection
          .universalIdentifier,
  )?.id ?? null;
