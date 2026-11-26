import { NavigationMenuItemType } from 'twenty-shared/types';

import {
  AGENTS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
  AUTOMATIONS_NAVIGATION_FOLDER,
  WORKSPACE_NAVIGATION_SECTION_UNIVERSAL_IDENTIFIER,
} from 'src/database/commands/upgrade-version-command/2-64/constants/automations-navigation-folder.constant';
import { buildAutomationsNavigationMenuItemOperations } from 'src/database/commands/upgrade-version-command/2-64/utils/build-automations-navigation-menu-item-operations.util';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';

const [ALL_WORKFLOWS_UNIVERSAL_IDENTIFIER, ALL_RUNS_UNIVERSAL_IDENTIFIER] =
  AUTOMATIONS_NAVIGATION_FOLDER.legacyChildUniversalIdentifiers;

const buildItem = (
  overrides: Partial<FlatNavigationMenuItem>,
): FlatNavigationMenuItem =>
  ({
    id: 'item',
    universalIdentifier: 'item',
    type: NavigationMenuItemType.OBJECT,
    userWorkspaceId: null,
    parentId: null,
    parentUniversalIdentifier: null,
    nativePageKey: null,
    overrides: null,
    position: 0,
    ...overrides,
  }) as FlatNavigationMenuItem;

const section = buildItem({
  id: 'section',
  universalIdentifier: WORKSPACE_NAVIGATION_SECTION_UNIVERSAL_IDENTIFIER,
  type: NavigationMenuItemType.SECTION,
});

const buildFolder = (
  overrides: Partial<FlatNavigationMenuItem> = {},
): FlatNavigationMenuItem =>
  buildItem({
    id: 'folder',
    universalIdentifier: AUTOMATIONS_NAVIGATION_FOLDER.universalIdentifier,
    type: NavigationMenuItemType.FOLDER,
    name: 'Workflows',
    parentId: 'section',
    parentUniversalIdentifier: section.universalIdentifier,
    position: 6,
    ...overrides,
  });

const folderChildren = [
  buildItem({
    id: 'all-workflows',
    universalIdentifier: ALL_WORKFLOWS_UNIVERSAL_IDENTIFIER,
    type: NavigationMenuItemType.NATIVE_PAGE,
    nativePageKey: 'workflows',
    parentId: 'folder',
    position: 0,
  }),
  buildItem({
    id: 'all-runs',
    universalIdentifier: ALL_RUNS_UNIVERSAL_IDENTIFIER,
    parentId: 'folder',
    position: 1,
  }),
];

const campaignsFolder = buildItem({
  id: 'campaigns',
  universalIdentifier: 'campaigns',
  type: NavigationMenuItemType.FOLDER,
  parentId: 'section',
  position: 7,
});

const build = (navigationMenuItems: FlatNavigationMenuItem[]) =>
  buildAutomationsNavigationMenuItemOperations({
    navigationMenuItems,
    agentsNavigationMenuItemId: 'agents',
    ownerApplication: {
      id: 'standard-app',
      universalIdentifier: 'standard-app-uid',
    },
    workspaceId: 'workspace',
    now: '2026-11-23T00:00:00.000Z',
  });

describe('buildAutomationsNavigationMenuItemOperations', () => {
  it('should rename the untouched folder and add Agents at its end', () => {
    const { flatEntityToCreate, flatEntityToUpdate } = build([
      section,
      buildFolder(),
      ...folderChildren,
      campaignsFolder,
    ]);

    expect(flatEntityToUpdate).toMatchObject([
      { id: 'folder', name: 'Automations' },
    ]);
    expect(flatEntityToCreate).toMatchObject([
      {
        id: 'agents',
        universalIdentifier: AGENTS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
        type: NavigationMenuItemType.NATIVE_PAGE,
        nativePageKey: 'agents',
        parentId: 'folder',
        parentUniversalIdentifier:
          AUTOMATIONS_NAVIGATION_FOLDER.universalIdentifier,
        position: 2,
        applicationId: 'standard-app',
      },
    ]);
  });

  it.each([
    ['renamed', [buildFolder({ name: 'Ops' }), ...folderChildren]],
    [
      'hidden',
      [
        buildFolder({
          overrides: {} as FlatNavigationMenuItem['overrides'],
        }),
        ...folderChildren,
      ],
    ],
    [
      'given an extra item',
      [
        buildFolder(),
        ...folderChildren,
        buildItem({
          id: 'extra',
          universalIdentifier: 'extra',
          parentId: 'folder',
        }),
      ],
    ],
    ['emptied of an item', [buildFolder(), folderChildren[0]]],
  ])(
    'should keep a %s folder as is and add Agents right after it',
    (_customization, folderItems) => {
      const { flatEntityToCreate, flatEntityToUpdate } = build([
        section,
        ...folderItems,
        campaignsFolder,
      ]);

      expect(flatEntityToUpdate).toEqual([]);
      expect(flatEntityToCreate).toMatchObject([
        {
          id: 'agents',
          parentId: 'section',
          parentUniversalIdentifier: section.universalIdentifier,
          position: 6.5,
        },
      ]);
    },
  );

  it('should add Agents at the end of the Workspace section when the folder was deleted', () => {
    const { flatEntityToCreate, flatEntityToUpdate } = build([
      section,
      campaignsFolder,
    ]);

    expect(flatEntityToUpdate).toEqual([]);
    expect(flatEntityToCreate).toMatchObject([
      { id: 'agents', parentId: 'section', position: 8 },
    ]);
  });

  it('should not add a second Agents item when the workspace already has one', () => {
    const { flatEntityToCreate, flatEntityToUpdate } = build([
      section,
      buildFolder(),
      ...folderChildren,
      buildItem({
        id: 'existing-agents',
        universalIdentifier: 'existing-agents',
        type: NavigationMenuItemType.NATIVE_PAGE,
        nativePageKey: 'agents',
        parentId: 'section',
      }),
    ]);

    expect(flatEntityToCreate).toEqual([]);
    expect(flatEntityToUpdate).toMatchObject([
      { id: 'folder', name: 'Automations' },
    ]);
  });

  it('should ignore member favorites and do nothing once applied', () => {
    const applied = [
      section,
      buildFolder({ name: 'Automations' }),
      ...folderChildren,
      buildItem({
        id: 'agents',
        universalIdentifier: AGENTS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
        type: NavigationMenuItemType.NATIVE_PAGE,
        nativePageKey: 'agents',
        parentId: 'folder',
        position: 2,
      }),
    ];

    expect(build(applied)).toEqual({
      flatEntityToCreate: [],
      flatEntityToUpdate: [],
    });

    const { flatEntityToCreate } = build([
      section,
      buildFolder(),
      ...folderChildren,
      buildItem({
        id: 'favorite',
        universalIdentifier: 'favorite',
        type: NavigationMenuItemType.NATIVE_PAGE,
        nativePageKey: 'agents',
        userWorkspaceId: 'member',
      }),
    ]);

    expect(flatEntityToCreate).toHaveLength(1);
  });
});
