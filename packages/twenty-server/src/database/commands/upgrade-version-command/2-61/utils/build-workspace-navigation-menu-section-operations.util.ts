import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { STANDARD_NAVIGATION_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-navigation-menu-item.constant';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';

const CONTAINER_TYPES_KEPT_AT_TOP_LEVEL: NavigationMenuItemType[] = [
  NavigationMenuItemType.TAB,
  NavigationMenuItemType.SECTION,
];

export const buildWorkspaceNavigationMenuSectionOperations = ({
  navigationMenuItems,
  sectionId,
  sectionName,
  movableApplicationIds,
  ownerApplication,
  workspaceId,
  now,
}: {
  navigationMenuItems: FlatNavigationMenuItem[];
  sectionId: string;
  sectionName: string;
  movableApplicationIds: Set<string>;
  ownerApplication: { id: string; universalIdentifier: string };
  workspaceId: string;
  now: string;
}): {
  flatEntityToCreate: FlatNavigationMenuItem[];
  flatEntityToUpdate: FlatNavigationMenuItem[];
} => {
  const workspaceRootItems = navigationMenuItems.filter(
    (item) => !isDefined(item.userWorkspaceId) && !isDefined(item.parentId),
  );

  if (
    navigationMenuItems.some(
      (item) =>
        item.universalIdentifier ===
        STANDARD_NAVIGATION_MENU_ITEMS.workspaceSection.universalIdentifier,
    )
  ) {
    return { flatEntityToCreate: [], flatEntityToUpdate: [] };
  }

  const itemsToMove = workspaceRootItems.filter(
    (item) =>
      !CONTAINER_TYPES_KEPT_AT_TOP_LEVEL.includes(item.type) &&
      movableApplicationIds.has(item.applicationId),
  );

  const lowestRootPosition = Math.min(
    0,
    ...workspaceRootItems.map((item) => item.position),
  );

  const section: FlatNavigationMenuItem = {
    id: sectionId,
    universalIdentifier: STANDARD_NAVIGATION_MENU_ITEMS.workspaceSection.universalIdentifier,
    type: NavigationMenuItemType.SECTION,
    name: sectionName,
    icon: null,
    color: null,
    link: null,
    nativePageKey: null,
    builtInSectionKey: null,
    isActive: true,
    overrides: null,
    userWorkspaceId: null,
    parentId: null,
    parentUniversalIdentifier: null,
    targetRecordId: null,
    targetObjectMetadataId: null,
    targetObjectMetadataUniversalIdentifier: null,
    viewId: null,
    viewUniversalIdentifier: null,
    pageLayoutId: null,
    pageLayoutUniversalIdentifier: null,
    agentChatChannelId: null,
    agentChatChannelUniversalIdentifier: null,
    workflowId: null,
    workflowUniversalIdentifier: null,
    agentId: null,
    agentUniversalIdentifier: null,
    position: lowestRootPosition - 1,
    workspaceId,
    applicationId: ownerApplication.id,
    applicationUniversalIdentifier: ownerApplication.universalIdentifier,
    createdAt: now,
    updatedAt: now,
  };

  return {
    flatEntityToCreate: [section],
    flatEntityToUpdate: itemsToMove.map((item) => ({
      ...item,
      parentId: sectionId,
      parentUniversalIdentifier:
        STANDARD_NAVIGATION_MENU_ITEMS.workspaceSection.universalIdentifier,
      updatedAt: now,
    })),
  };
};
