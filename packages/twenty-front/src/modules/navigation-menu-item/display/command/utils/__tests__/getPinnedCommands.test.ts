import { EMPTY_COMMAND_MENU_CONTEXT_API } from '@/command-menu-item/constants/EmptyCommandMenuContextApi';
import { createMockCommandMenuItems } from '@/command-menu-item/mock/command-menu-items.mock';
import { getPinnedCommands } from '@/navigation-menu-item/display/command/utils/getPinnedCommands';
import { NavigationMenuItemType } from 'twenty-shared/types';
import {
  CommandMenuItemAvailabilityType,
  type CommandMenuItemFieldsFragment,
  EngineComponentKey,
} from '~/generated-metadata/graphql';

const [baseCommandMenuItem] = createMockCommandMenuItems();

const buildCommandMenuItem = (
  overrides: Partial<CommandMenuItemFieldsFragment> &
    Pick<CommandMenuItemFieldsFragment, 'id'>,
): CommandMenuItemFieldsFragment => ({
  ...baseCommandMenuItem,
  engineComponentKey: EngineComponentKey.SEARCH_RECORDS,
  availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
  ...overrides,
});

const SEARCH = buildCommandMenuItem({ id: 'search', label: 'Search' });
const NEW_CHAT = buildCommandMenuItem({
  id: 'new-chat',
  label: 'New chat',
  conditionalAvailabilityExpression: 'permissionFlags.AI',
});
const DELETE = buildCommandMenuItem({
  id: 'delete',
  label: 'Delete',
  availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
});

const buildCommandNavigationMenuItem = ({
  id,
  commandMenuItemId,
  position,
  parentId = null,
}: {
  id: string;
  commandMenuItemId: string;
  position: number;
  parentId?: string | null;
}) => ({
  id,
  type: NavigationMenuItemType.COMMAND,
  commandMenuItemId,
  position,
  parentId,
});

describe('getPinnedCommands', () => {
  it('should return top-level command items in position order', () => {
    const pinnedCommands = getPinnedCommands({
      navigationMenuItems: [
        buildCommandNavigationMenuItem({
          id: 'pinned-new-chat',
          commandMenuItemId: NEW_CHAT.id,
          position: 2,
        }),
        buildCommandNavigationMenuItem({
          id: 'pinned-search',
          commandMenuItemId: SEARCH.id,
          position: 1,
        }),
      ],
      commandMenuItems: [SEARCH, NEW_CHAT],
      commandMenuContextApi: {
        ...EMPTY_COMMAND_MENU_CONTEXT_API,
        permissionFlags: { AI: true },
      },
    });

    expect(
      pinnedCommands.map(({ navigationMenuItemId }) => navigationMenuItemId),
    ).toEqual(['pinned-search', 'pinned-new-chat']);
  });

  it('should skip commands that are missing, not global or unavailable', () => {
    const pinnedCommands = getPinnedCommands({
      navigationMenuItems: [
        buildCommandNavigationMenuItem({
          id: 'pinned-search',
          commandMenuItemId: SEARCH.id,
          position: 1,
        }),
        buildCommandNavigationMenuItem({
          id: 'pinned-new-chat',
          commandMenuItemId: NEW_CHAT.id,
          position: 2,
        }),
        buildCommandNavigationMenuItem({
          id: 'pinned-delete',
          commandMenuItemId: DELETE.id,
          position: 3,
        }),
        buildCommandNavigationMenuItem({
          id: 'pinned-deleted-command',
          commandMenuItemId: 'deleted-command',
          position: 4,
        }),
      ],
      commandMenuItems: [SEARCH, NEW_CHAT, DELETE],
      commandMenuContextApi: EMPTY_COMMAND_MENU_CONTEXT_API,
    });

    expect(
      pinnedCommands.map(({ navigationMenuItemId }) => navigationMenuItemId),
    ).toEqual(['pinned-search']);
  });

  it('should ignore command items nested under a parent and other item types', () => {
    const pinnedCommands = getPinnedCommands({
      navigationMenuItems: [
        buildCommandNavigationMenuItem({
          id: 'nested-search',
          commandMenuItemId: SEARCH.id,
          position: 1,
          parentId: 'tab-id',
        }),
        {
          id: 'link',
          type: NavigationMenuItemType.LINK,
          commandMenuItemId: null,
          position: 2,
          parentId: null,
        },
      ],
      commandMenuItems: [SEARCH],
      commandMenuContextApi: EMPTY_COMMAND_MENU_CONTEXT_API,
    });

    expect(pinnedCommands).toEqual([]);
  });
});
