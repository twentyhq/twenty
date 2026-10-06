import { NavigationMenuItemType } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { STANDARD_NAVIGATION_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-navigation-menu-item.constant';

export const buildWorkflowsNavigationLinkToCreate = ({
  legacyWorkflowsNavigationMenuItem,
  now,
}: {
  legacyWorkflowsNavigationMenuItem: FlatNavigationMenuItem;
  now: string;
}): FlatNavigationMenuItem => {
  const definition = STANDARD_NAVIGATION_MENU_ITEMS.workflowsFolderAllWorkflows;

  return {
    ...legacyWorkflowsNavigationMenuItem,
    id: v4(),
    universalIdentifier: definition.universalIdentifier,
    type: NavigationMenuItemType.LINK,
    name: definition.name,
    link: definition.link,
    icon: legacyWorkflowsNavigationMenuItem.icon ?? definition.icon,
    targetRecordId: null,
    targetObjectMetadataId: null,
    targetObjectMetadataUniversalIdentifier: null,
    viewId: null,
    viewUniversalIdentifier: null,
    createdAt: now,
    updatedAt: now,
  };
};
