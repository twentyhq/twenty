import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  AGENTS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  AUTOMATIONS_NAVIGATION_FOLDER,
  WORKSPACE_NAVIGATION_SECTION_UNIVERSAL_IDENTIFIER,
} from 'src/database/commands/upgrade-version-command/2-64/constants/automations-navigation-folder.constant';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';

type AgentsNavigationMenuItemPlacement = Pick<
  FlatNavigationMenuItem,
  'parentId' | 'parentUniversalIdentifier' | 'position'
>;

const computePositionAfterLastSibling = (
  siblings: FlatNavigationMenuItem[],
): number => Math.max(-1, ...siblings.map((sibling) => sibling.position)) + 1;

const computePositionRightAfter = ({
  navigationMenuItem,
  siblings,
}: {
  navigationMenuItem: Pick<FlatNavigationMenuItem, 'position'>;
  siblings: Pick<FlatNavigationMenuItem, 'position'>[];
}): number => {
  const followingPositions = siblings
    .map((sibling) => sibling.position)
    .filter((position) => position > navigationMenuItem.position);

  return followingPositions.length === 0
    ? navigationMenuItem.position + 1
    : (navigationMenuItem.position + Math.min(...followingPositions)) / 2;
};

export const buildAutomationsNavigationMenuItemOperations = ({
  navigationMenuItems,
  agentsNavigationMenuItemId,
  ownerApplication,
  workspaceId,
  now,
}: {
  navigationMenuItems: FlatNavigationMenuItem[];
  agentsNavigationMenuItemId: string;
  ownerApplication: { id: string; universalIdentifier: string };
  workspaceId: string;
  now: string;
}): {
  flatEntityToCreate: FlatNavigationMenuItem[];
  flatEntityToUpdate: FlatNavigationMenuItem[];
} => {
  const workspaceNavigationMenuItems = navigationMenuItems.filter(
    (navigationMenuItem) => !isDefined(navigationMenuItem.userWorkspaceId),
  );

  const findChildren = (parentId: string | null): FlatNavigationMenuItem[] =>
    workspaceNavigationMenuItems.filter(
      (navigationMenuItem) => navigationMenuItem.parentId === parentId,
    );

  const folder = workspaceNavigationMenuItems.find(
    (navigationMenuItem) =>
      navigationMenuItem.universalIdentifier ===
      AUTOMATIONS_NAVIGATION_FOLDER.universalIdentifier,
  );

  const isFolderUntouched =
    isDefined(folder) &&
    folder.name === AUTOMATIONS_NAVIGATION_FOLDER.legacyName &&
    !isDefined(folder.overrides) &&
    findChildren(folder.id)
      .map((child) => child.universalIdentifier)
      .sort()
      .join() ===
      [...AUTOMATIONS_NAVIGATION_FOLDER.legacyChildUniversalIdentifiers]
        .sort()
        .join();

  const untouchedFolder = isFolderUntouched ? folder : undefined;

  const hasAgentsNavigationMenuItem = workspaceNavigationMenuItems.some(
    (navigationMenuItem) =>
      navigationMenuItem.universalIdentifier ===
        AGENTS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER ||
      (navigationMenuItem.type === NavigationMenuItemType.NATIVE_PAGE &&
        navigationMenuItem.nativePageKey === 'agents'),
  );

  const computeAgentsNavigationMenuItemPlacement =
    (): AgentsNavigationMenuItemPlacement => {
      if (isDefined(untouchedFolder)) {
        return {
          parentId: untouchedFolder.id,
          parentUniversalIdentifier: untouchedFolder.universalIdentifier,
          position: computePositionAfterLastSibling(
            findChildren(untouchedFolder.id),
          ),
        };
      }

      if (isDefined(folder)) {
        return {
          parentId: folder.parentId,
          parentUniversalIdentifier: folder.parentUniversalIdentifier,
          position: computePositionRightAfter({
            navigationMenuItem: folder,
            siblings: findChildren(folder.parentId),
          }),
        };
      }

      const workspaceSection = workspaceNavigationMenuItems.find(
        (navigationMenuItem) =>
          navigationMenuItem.universalIdentifier ===
          WORKSPACE_NAVIGATION_SECTION_UNIVERSAL_IDENTIFIER,
      );

      return {
        parentId: workspaceSection?.id ?? null,
        parentUniversalIdentifier:
          workspaceSection?.universalIdentifier ?? null,
        position: computePositionAfterLastSibling(
          findChildren(workspaceSection?.id ?? null),
        ),
      };
    };

  const agentsNavigationMenuItem: FlatNavigationMenuItem = {
    id: agentsNavigationMenuItemId,
    universalIdentifier: AGENTS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
    type: NavigationMenuItemType.NATIVE_PAGE,
    nativePageKey: 'agents',
    name: null,
    icon: null,
    color: null,
    link: null,
    builtInSectionKey: null,
    isActive: true,
    overrides: null,
    userWorkspaceId: null,
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
    workspaceId,
    applicationId: ownerApplication.id,
    applicationUniversalIdentifier: ownerApplication.universalIdentifier,
    createdAt: now,
    updatedAt: now,
    ...computeAgentsNavigationMenuItemPlacement(),
  };

  const flatEntityToCreate = hasAgentsNavigationMenuItem
    ? []
    : [agentsNavigationMenuItem];

  if (!isDefined(untouchedFolder)) {
    return { flatEntityToCreate, flatEntityToUpdate: [] };
  }

  return {
    flatEntityToCreate,
    flatEntityToUpdate: [
      {
        ...untouchedFolder,
        name: AUTOMATIONS_NAVIGATION_FOLDER.name,
        updatedAt: now,
      },
    ],
  };
};
