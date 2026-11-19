import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { validateNavigationMenuItemHierarchy } from 'src/engine/metadata-modules/flat-navigation-menu-item/validators/utils/validate-navigation-menu-item-hierarchy.util';
import { WORKSPACE_NAVIGATION_MENU_SECTION_UNIVERSAL_IDENTIFIER } from 'src/engine/metadata-modules/flat-navigation-menu-item/constants/workspace-navigation-menu-section-universal-identifier.constant';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';

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
        WORKSPACE_NAVIGATION_MENU_SECTION_UNIVERSAL_IDENTIFIER,
    )
  ) {
    return { flatEntityToCreate: [], flatEntityToUpdate: [] };
  }

  const itemsToMove = workspaceRootItems.filter(
    (item) =>
      validateNavigationMenuItemHierarchy({
        type: item.type,
        parentType: NavigationMenuItemType.SECTION,
      }).length === 0 &&
      movableApplicationIds.has(item.applicationId),
  );

  const lowestRootPosition = Math.min(
    0,
    ...workspaceRootItems.map((item) => item.position),
  );

  const section: FlatNavigationMenuItem = {
    id: sectionId,
    universalIdentifier: WORKSPACE_NAVIGATION_MENU_SECTION_UNIVERSAL_IDENTIFIER,
    type: NavigationMenuItemType.SECTION,
    name: sectionName,
    icon: null,
    color: null,
    link: null,
    nativePageKey: null,
    builtInSectionKey: null,
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
        WORKSPACE_NAVIGATION_MENU_SECTION_UNIVERSAL_IDENTIFIER,
      updatedAt: now,
    })),
  };
};
