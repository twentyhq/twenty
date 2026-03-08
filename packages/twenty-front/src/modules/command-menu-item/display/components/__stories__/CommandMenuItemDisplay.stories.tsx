import { CommandMenuItemDisplay } from '@/command-menu-item/display/components/CommandMenuItemDisplay';
import { SingleRecordCommandKeys } from '@/command-menu-item/record/single-record/types/SingleRecordCommandKeys';
import { CommandMenuItemConfigContext } from '@/command-menu-item/contexts/CommandMenuItemConfigContext';
import { CommandMenuItemContext } from '@/command-menu-item/contexts/CommandMenuItemContext';
import { createMockCommandMenuItems } from '@/command-menu-item/mock/command-menu-items.mock';
import { getCommandMenuItemLabel } from '@/command-menu-item/utils/getCommandMenuItemLabel';
import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';

type Story = StoryObj<typeof CommandMenuItemDisplay>;

const deleteMock = fn();
const addToFavoritesMock = fn();

const mockActions = createMockCommandMenuItems({
  deleteMock,
  addToFavoritesMock,
});

const addToFavoritesCommandMenuItem = mockActions.find(
  (action) => action.key === SingleRecordCommandKeys.ADD_TO_FAVORITES,
);

if (!addToFavoritesCommandMenuItem) {
  throw new Error('addToFavoritesCommandMenuItem not found');
}

const meta: Meta<typeof CommandMenuItemDisplay> = {
  title: 'Modules/ActionMenu/Actions/Display/CommandMenuItemDisplay',
  component: CommandMenuItemDisplay,
  decorators: [
    (Story) => (
      <CommandMenuItemConfigContext.Provider
        value={addToFavoritesCommandMenuItem}
      >
        <Story />
      </CommandMenuItemConfigContext.Provider>
    ),
    ComponentDecorator,
    RouterDecorator,
  ],
};

export default meta;

export const AsButton: Story = {
  args: {
    onClick: addToFavoritesMock,
  },
  decorators: [
    (Story) => (
      <CommandMenuItemContext.Provider
        value={{
          isInSidePanel: false,
          actionMenuType: 'command-menu',
          displayType: 'button',
          actions: [],
        }}
      >
        <Story />
      </CommandMenuItemContext.Provider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByText(
        getCommandMenuItemLabel(
          addToFavoritesCommandMenuItem?.shortLabel ?? '',
        ),
      ),
    );
    expect(addToFavoritesMock).toHaveBeenCalled();
  },
};

export const AsListItem: Story = {
  args: {
    onClick: addToFavoritesMock,
  },
  decorators: [
    (Story) => (
      <SelectableListComponentInstanceContext.Provider
        value={{ instanceId: 'story' }}
      >
        <Story />
      </SelectableListComponentInstanceContext.Provider>
    ),
    (Story) => (
      <CommandMenuItemContext.Provider
        value={{
          isInSidePanel: false,
          actionMenuType: 'command-menu',
          displayType: 'listItem',
          actions: [],
        }}
      >
        <Story />
      </CommandMenuItemContext.Provider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByText(
        getCommandMenuItemLabel(addToFavoritesCommandMenuItem?.label ?? ''),
      ),
    );
    expect(addToFavoritesMock).toHaveBeenCalled();
  },
};

export const AsDropdownItem: Story = {
  args: {
    onClick: addToFavoritesMock,
  },
  decorators: [
    (Story) => (
      <SelectableListComponentInstanceContext.Provider
        value={{ instanceId: 'story' }}
      >
        <Story />
      </SelectableListComponentInstanceContext.Provider>
    ),
    (Story) => (
      <CommandMenuItemContext.Provider
        value={{
          isInSidePanel: false,
          actionMenuType: 'command-menu',
          displayType: 'dropdownItem',
          actions: [],
        }}
      >
        <Story />
      </CommandMenuItemContext.Provider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByText(
        getCommandMenuItemLabel(addToFavoritesCommandMenuItem?.label ?? ''),
      ),
    );
    expect(addToFavoritesMock).toHaveBeenCalled();
  },
};
