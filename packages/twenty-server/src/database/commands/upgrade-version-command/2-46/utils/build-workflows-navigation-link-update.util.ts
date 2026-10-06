import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  WORKFLOWS_NAVIGATION_LINK,
  WORKFLOWS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
} from 'src/database/commands/upgrade-version-command/2-46/constants/legacy-workflow-object-universal-identifiers.constant';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';

export const buildWorkflowsNavigationLinkUpdate = ({
  flatNavigationMenuItemsByUniversalIdentifier,
  now,
}: {
  flatNavigationMenuItemsByUniversalIdentifier: Record<
    string,
    FlatNavigationMenuItem | undefined
  >;
  now: string;
}): FlatNavigationMenuItem | undefined => {
  const workflowsNavigationMenuItem =
    flatNavigationMenuItemsByUniversalIdentifier[
      WORKFLOWS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER
    ];

  if (
    !isDefined(workflowsNavigationMenuItem) ||
    workflowsNavigationMenuItem.type !== NavigationMenuItemType.OBJECT
  ) {
    return undefined;
  }

  return {
    ...workflowsNavigationMenuItem,
    type: NavigationMenuItemType.LINK,
    name: 'Workflows',
    link: WORKFLOWS_NAVIGATION_LINK,
    icon: workflowsNavigationMenuItem.icon ?? 'IconSettingsAutomation',
    targetObjectMetadataId: null,
    targetObjectMetadataUniversalIdentifier: null,
    viewId: null,
    viewUniversalIdentifier: null,
    updatedAt: now,
  };
};
