import { buildDefaultLayoutNavigationMenuItemsToCreate } from 'src/database/commands/upgrade-version-command/2-64/utils/build-default-layout-navigation-menu-items-to-create.util';
import { NavigationMenuItemType } from 'src/engine/metadata-modules/navigation-menu-item/enums/navigation-menu-item-type.enum';
import { STANDARD_NAVIGATION_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-navigation-menu-item.constant';

type NavigationMenuItemFixture = Parameters<
  typeof buildDefaultLayoutNavigationMenuItemsToCreate
>[0]['navigationMenuItems'][number];

const buildItem = (
  overrides: Partial<NavigationMenuItemFixture>,
): NavigationMenuItemFixture => ({
  universalIdentifier: 'item',
  userWorkspaceId: null,
  parentId: null,
  position: 0,
  builtInSectionKey: null,
  type: NavigationMenuItemType.SECTION,
  ...overrides,
});

const build = (navigationMenuItems: NavigationMenuItemFixture[]) => {
  let nextId = 0;

  return buildDefaultLayoutNavigationMenuItemsToCreate({
    navigationMenuItems,
    generateId: () => `id-${nextId++}`,
    twentyStandardApplication: {
      id: 'standard-app',
      universalIdentifier: 'standard-app-uid',
    },
    workspaceId: 'workspace',
    now: '2026-11-24T00:00:00.000Z',
  });
};

describe('buildDefaultLayoutNavigationMenuItemsToCreate', () => {
  it('should add Inbox above every Home root item and a Chats tab after existing tabs', () => {
    const itemsToCreate = build([
      buildItem({ universalIdentifier: 'favorites', position: -1 }),
      buildItem({ universalIdentifier: 'workspace-section', position: 0 }),
      buildItem({
        universalIdentifier: 'custom-tab',
        type: NavigationMenuItemType.TAB,
        position: 3,
      }),
      buildItem({ userWorkspaceId: 'member', position: -9 }),
    ]);

    expect(itemsToCreate).toMatchObject([
      {
        universalIdentifier:
          STANDARD_NAVIGATION_MENU_ITEMS.inboxSection.universalIdentifier,
        builtInSectionKey: 'aiChatInbox',
        parentId: null,
        position: -2,
      },
      {
        id: 'id-1',
        universalIdentifier:
          STANDARD_NAVIGATION_MENU_ITEMS.chatsTab.universalIdentifier,
        type: NavigationMenuItemType.TAB,
        name: 'Chats',
        icon: 'IconMessage',
        position: 4,
      },
      { builtInSectionKey: 'aiChatFavorites', parentId: 'id-1', position: 0 },
      { builtInSectionKey: 'aiChatChannels', parentId: 'id-1', position: 1 },
      { builtInSectionKey: 'aiChatRecents', parentId: 'id-1', position: 2 },
    ]);
  });

  it('should skip Inbox when an Inbox section already exists anywhere', () => {
    const itemsToCreate = build([
      buildItem({ builtInSectionKey: 'aiChatInbox', parentId: 'tab' }),
    ]);

    expect(
      itemsToCreate.some(
        ({ builtInSectionKey }) => builtInSectionKey === 'aiChatInbox',
      ),
    ).toBe(false);
  });

  it('should only add the chat sections the workspace does not have yet', () => {
    const itemsToCreate = build([
      buildItem({ builtInSectionKey: 'aiChatChannels', parentId: 'tab' }),
    ]);

    expect(
      itemsToCreate.map(({ builtInSectionKey }) => builtInSectionKey),
    ).toEqual(['aiChatInbox', null, 'aiChatFavorites', 'aiChatRecents']);
  });

  it('should skip the Chats tab when the standard tab or every chat section exists', () => {
    expect(
      build([
        buildItem({
          universalIdentifier:
            STANDARD_NAVIGATION_MENU_ITEMS.chatsTab.universalIdentifier,
          type: NavigationMenuItemType.TAB,
        }),
        buildItem({ builtInSectionKey: 'aiChatInbox' }),
      ]),
    ).toEqual([]);

    expect(
      build([
        buildItem({ builtInSectionKey: 'aiChatInbox' }),
        buildItem({ builtInSectionKey: 'aiChatFavorites' }),
        buildItem({ builtInSectionKey: 'aiChatChannels' }),
        buildItem({ builtInSectionKey: 'aiChatRecents' }),
      ]),
    ).toEqual([]);
  });

  it('should skip the Chats tab when the workspace already has as many tabs as the sidebar shows', () => {
    const tabs = [0, 1, 2].map((position) =>
      buildItem({
        universalIdentifier: `tab-${position}`,
        type: NavigationMenuItemType.TAB,
        position,
      }),
    );

    expect(
      build([...tabs, buildItem({ builtInSectionKey: 'aiChatInbox' })]),
    ).toEqual([]);
  });
});
