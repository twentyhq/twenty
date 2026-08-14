import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { Provider as JotaiProvider } from 'jotai';
import { expect, waitFor, within } from 'storybook/test';

import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { EMPTY_COMMAND_MENU_CONTEXT_API } from '@/command-menu-item/constants/EmptyCommandMenuContextApi';
import { SidePanelCommandMenuItemDisplayPage } from '@/command-menu-item/display/components/SidePanelCommandMenuItemDisplayPage';
import { commandMenuPinnedInlineLayoutFamilyState } from '@/command-menu-item/display/states/commandMenuPinnedInlineLayoutFamilyState';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { RouterDecorator } from 'twenty-ui/testing';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import {
  CommandMenuItemAvailabilityType,
  EngineComponentKey,
  type CommandMenuItemFieldsFragment,
} from '~/generated-metadata/graphql';

const PINNED_ITEM_WIDTH = 100;

const createCommandMenuItem = (
  overrides: Partial<CommandMenuItemFieldsFragment> &
    Pick<CommandMenuItemFieldsFragment, 'id' | 'label'>,
): CommandMenuItemFieldsFragment => ({
  __typename: 'CommandMenuItem',
  isActive: true,
  workflowVersionId: null,
  frontComponentId: null,
  frontComponent: null,
  engineComponentKey: EngineComponentKey.GO_TO_PEOPLE,
  icon: 'IconUser',
  shortLabel: overrides.label,
  position: 1,
  isPinned: false,
  hotKeys: null,
  conditionalAvailabilityExpression: null,
  availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
  availabilityObjectMetadataId: null,
  payload: null,
  ...overrides,
});

const PINNED_ITEMS = [
  createCommandMenuItem({
    id: 'story-pinned-add-to-favorites',
    label: 'Add to favorites',
    icon: 'IconHeart',
    engineComponentKey: EngineComponentKey.ADD_TO_FAVORITES,
    isPinned: true,
  }),
  createCommandMenuItem({
    id: 'story-pinned-delete',
    label: 'Delete',
    icon: 'IconTrash',
    engineComponentKey: EngineComponentKey.DELETE_SINGLE_RECORD,
    isPinned: true,
  }),
];

const OTHER_ITEM = createCommandMenuItem({
  id: 'story-go-to-people',
  label: 'Go to People',
});

const FALLBACK_ITEM = createCommandMenuItem({
  id: 'story-search-records-fallback',
  label: 'Search records',
  icon: 'IconSearch',
  engineComponentKey: EngineComponentKey.SEARCH_RECORDS_FALLBACK,
  availabilityType: CommandMenuItemAvailabilityType.FALLBACK,
});

type CreateDecoratorParams = {
  commandMenuItems: CommandMenuItemFieldsFragment[];
  sidePanelSearch: string;
  pinnedItemsContainerWidth: number;
};

const createDecorator =
  ({
    commandMenuItems,
    sidePanelSearch,
    pinnedItemsContainerWidth,
  }: CreateDecoratorParams): Decorator =>
  (Story) => {
    jotaiStore.set(sidePanelSearchState.atom, sidePanelSearch);
    jotaiStore.set(
      commandMenuPinnedInlineLayoutFamilyState.atomFamily('page-header'),
      {
        containerWidth: pinnedItemsContainerWidth,
        leadingActionWidth: 0,
        commandMenuItemWidthsByKey: Object.fromEntries(
          PINNED_ITEMS.map((item) => [item.id, PINNED_ITEM_WIDTH]),
        ),
      },
    );

    return (
      <JotaiProvider store={jotaiStore}>
        <CommandMenuComponentInstanceContext.Provider
          value={{ instanceId: 'story-command-menu' }}
        >
          <CommandMenuContext.Provider
            value={{
              displayType: 'listItem',
              containerType: CommandMenuItemContainerType.CommandMenuList,
              commandMenuItems,
              commandMenuContextApi: EMPTY_COMMAND_MENU_CONTEXT_API,
              isInPreviewMode: false,
            }}
          >
            <Story />
          </CommandMenuContext.Provider>
        </CommandMenuComponentInstanceContext.Provider>
      </JotaiProvider>
    );
  };

const meta: Meta<typeof SidePanelCommandMenuItemDisplayPage> = {
  title: 'Modules/CommandMenu/SidePanelCommandMenuItemDisplayPage',
  component: SidePanelCommandMenuItemDisplayPage,
  decorators: [
    ContextStoreDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    RouterDecorator,
  ],
};

export default meta;

type Story = StoryObj<typeof SidePanelCommandMenuItemDisplayPage>;

export const EmptySearchWithAllPinnedItemsInHeader: Story = {
  decorators: [
    createDecorator({
      commandMenuItems: [...PINNED_ITEMS, FALLBACK_ITEM],
      sidePanelSearch: '',
      pinnedItemsContainerWidth: 1000,
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Search records')).toBeVisible();
    await waitFor(() => {
      expect(canvas.queryByText('No results found')).not.toBeInTheDocument();
    });
    expect(canvas.queryByText('Delete')).not.toBeInTheDocument();
  },
};

export const WhitespaceOnlySearchWithAllPinnedItemsInHeader: Story = {
  decorators: [
    createDecorator({
      commandMenuItems: [...PINNED_ITEMS, FALLBACK_ITEM],
      sidePanelSearch: '   ',
      pinnedItemsContainerWidth: 1000,
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Search records')).toBeVisible();
    await waitFor(() => {
      expect(canvas.queryByText('No results found')).not.toBeInTheDocument();
    });
    expect(canvas.queryByText('Delete')).not.toBeInTheDocument();
  },
};

export const EmptySearchWithOverflowingPinnedItems: Story = {
  decorators: [
    createDecorator({
      commandMenuItems: [...PINNED_ITEMS, OTHER_ITEM],
      sidePanelSearch: '',
      pinnedItemsContainerWidth: PINNED_ITEM_WIDTH,
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Delete')).toBeVisible();
    expect(await canvas.findByText('Go to People')).toBeVisible();
    await waitFor(() => {
      expect(canvas.queryByText('No results found')).not.toBeInTheDocument();
    });
  },
};

export const SearchWithMatchingItems: Story = {
  decorators: [
    createDecorator({
      commandMenuItems: [...PINNED_ITEMS, OTHER_ITEM, FALLBACK_ITEM],
      sidePanelSearch: 'delete',
      pinnedItemsContainerWidth: 1000,
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Delete')).toBeVisible();
    await waitFor(() => {
      expect(canvas.queryByText('No results found')).not.toBeInTheDocument();
      expect(canvas.queryByText('Search records')).not.toBeInTheDocument();
    });
  },
};

export const SearchWithoutMatchingItemsAndWithoutFallback: Story = {
  decorators: [
    createDecorator({
      commandMenuItems: [...PINNED_ITEMS, OTHER_ITEM],
      sidePanelSearch: 'nothing matches this',
      pinnedItemsContainerWidth: 1000,
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('No results found')).toBeVisible();
  },
};

export const SearchWithoutMatchingItemsAndWithFallback: Story = {
  decorators: [
    createDecorator({
      commandMenuItems: [...PINNED_ITEMS, OTHER_ITEM, FALLBACK_ITEM],
      sidePanelSearch: 'nothing matches this',
      pinnedItemsContainerWidth: 1000,
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Search records')).toBeVisible();
    await waitFor(() => {
      expect(canvas.queryByText('No results found')).not.toBeInTheDocument();
    });
  },
};
