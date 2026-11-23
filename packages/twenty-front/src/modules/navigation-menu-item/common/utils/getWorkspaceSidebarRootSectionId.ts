import { STANDARD_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/metadata';

import { type NavigationMenuItem } from '~/generated-metadata/graphql';

// TODO(@thomtrp): remove once IS_CUSTOMIZABLE_SIDEBAR_ENABLED is on for every workspace
export const getWorkspaceSidebarRootSectionId = (
  navigationMenuItems: Pick<NavigationMenuItem, 'id' | 'universalIdentifier'>[],
): string | null =>
  navigationMenuItems.find(
    (item) =>
      item.universalIdentifier ===
      STANDARD_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIERS.workspaceSection
        .universalIdentifier,
  )?.id ?? null;
