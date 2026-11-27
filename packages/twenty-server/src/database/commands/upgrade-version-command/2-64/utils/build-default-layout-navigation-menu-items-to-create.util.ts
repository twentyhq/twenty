import { type BuiltInSectionKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { NavigationMenuItemType } from 'src/engine/metadata-modules/navigation-menu-item/enums/navigation-menu-item-type.enum';
import { STANDARD_NAVIGATION_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-navigation-menu-item.constant';

type ExistingNavigationMenuItem = Pick<
  FlatNavigationMenuItem,
  | 'universalIdentifier'
  | 'userWorkspaceId'
  | 'parentId'
  | 'builtInSectionKey'
  | 'position'
  | 'type'
>;

const CUSTOM_TAB_LIMIT = 3;

const CHATS_TAB_SECTIONS = [
  STANDARD_NAVIGATION_MENU_ITEMS.chatsTabFavoriteChats,
  STANDARD_NAVIGATION_MENU_ITEMS.chatsTabChannels,
  STANDARD_NAVIGATION_MENU_ITEMS.chatsTabRecentChats,
];

export const buildDefaultLayoutNavigationMenuItemsToCreate = ({
  navigationMenuItems,
  generateId,
  twentyStandardApplication,
  workspaceId,
  now,
}: {
  navigationMenuItems: ExistingNavigationMenuItem[];
  generateId: () => string;
  twentyStandardApplication: { id: string; universalIdentifier: string };
  workspaceId: string;
  now: string;
}): FlatNavigationMenuItem[] => {
  const workspaceItems = navigationMenuItems.filter(
    (item) => !isDefined(item.userWorkspaceId),
  );
  const isAlreadyThere = ({
    universalIdentifier,
    builtInSectionKey,
  }: {
    universalIdentifier: string;
    builtInSectionKey?: BuiltInSectionKey;
  }) =>
    workspaceItems.some(
      (item) =>
        item.universalIdentifier === universalIdentifier ||
        (isDefined(builtInSectionKey) &&
          item.builtInSectionKey === builtInSectionKey),
    );

  const buildRow = ({
    id,
    universalIdentifier,
    type,
    name = null,
    icon = null,
    builtInSectionKey = null,
    parent = null,
    position,
  }: {
    id: string;
    universalIdentifier: string;
    type: NavigationMenuItemType;
    name?: string | null;
    icon?: string | null;
    builtInSectionKey?: BuiltInSectionKey | null;
    parent?: { id: string; universalIdentifier: string } | null;
    position: number;
  }): FlatNavigationMenuItem => ({
    id,
    universalIdentifier,
    type,
    name,
    icon,
    color: null,
    link: null,
    nativePageKey: null,
    builtInSectionKey,
    visibleItemLimit: null,
    isActive: true,
    overrides: null,
    userWorkspaceId: null,
    parentId: parent?.id ?? null,
    parentUniversalIdentifier: parent?.universalIdentifier ?? null,
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
    position,
    workspaceId,
    applicationId: twentyStandardApplication.id,
    applicationUniversalIdentifier:
      twentyStandardApplication.universalIdentifier,
    createdAt: now,
    updatedAt: now,
  });

  const itemsToCreate: FlatNavigationMenuItem[] = [];

  const inboxSectionDefinition = STANDARD_NAVIGATION_MENU_ITEMS.inboxSection;

  if (!isAlreadyThere(inboxSectionDefinition)) {
    const homeRootPositions = workspaceItems
      .filter(
        (item) =>
          !isDefined(item.parentId) && item.type !== NavigationMenuItemType.TAB,
      )
      .map((item) => item.position);

    itemsToCreate.push(
      buildRow({
        id: generateId(),
        universalIdentifier: inboxSectionDefinition.universalIdentifier,
        type: NavigationMenuItemType.SECTION,
        builtInSectionKey: inboxSectionDefinition.builtInSectionKey,
        position: Math.min(0, ...homeRootPositions) - 1,
      }),
    );
  }

  const chatsTabDefinition = STANDARD_NAVIGATION_MENU_ITEMS.chatsTab;
  const chatsTabSectionsToCreate = CHATS_TAB_SECTIONS.filter(
    (sectionDefinition) => !isAlreadyThere(sectionDefinition),
  );
  const tabPositions = workspaceItems
    .filter((item) => item.type === NavigationMenuItemType.TAB)
    .map((item) => item.position);

  if (
    isAlreadyThere(chatsTabDefinition) ||
    chatsTabSectionsToCreate.length === 0 ||
    tabPositions.length >= CUSTOM_TAB_LIMIT
  ) {
    return itemsToCreate;
  }

  const chatsTab = buildRow({
    id: generateId(),
    universalIdentifier: chatsTabDefinition.universalIdentifier,
    type: NavigationMenuItemType.TAB,
    name: chatsTabDefinition.name,
    icon: chatsTabDefinition.icon,
    position: Math.max(-1, ...tabPositions) + 1,
  });

  return [
    ...itemsToCreate,
    chatsTab,
    ...chatsTabSectionsToCreate.map((sectionDefinition) =>
      buildRow({
        id: generateId(),
        universalIdentifier: sectionDefinition.universalIdentifier,
        type: NavigationMenuItemType.SECTION,
        builtInSectionKey: sectionDefinition.builtInSectionKey,
        parent: chatsTab,
        position: sectionDefinition.position,
      }),
    ),
  ];
};
