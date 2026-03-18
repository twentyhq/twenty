import { CommandMenuItemDisplay } from '@/command-menu-item/display/components/CommandMenuItemDisplay';
import { SingleRecordCommandKeys } from '@/command-menu-item/record/single-record/types/SingleRecordCommandKeys';
import { CommandConfigContext } from '@/command-menu-item/contexts/CommandConfigContext';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
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
  title: 'Modules/CommandMenuItem/Display/CommandMenuItemDisplay',
  component: CommandMenuItemDisplay,
  decorators: [
    (Story) => (
      <CommandConfigContext.Provider value={addToFavoritesCommandMenuItem}>
        <Story />
      </CommandConfigContext.Provider>
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
      <CommandMenuContext.Provider
        value={{
          isInSidePanel: false,
          containerType: 'command-menu-list',
          displayType: 'button',
          commandMenuItems: [],
        }}
      >
        <Story />
      </CommandMenuContext.Provider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByText(
        getCommandMenuItemLabel(addToFavoritesCommandMenuItem?.shortLabel),
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
      <CommandMenuContext.Provider
        value={{
          isInSidePanel: false,
          containerType: 'command-menu-list',
          displayType: 'listItem',
          commandMenuItems: [],
        }}
      >
        <Story />
      </CommandMenuContext.Provider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByText(
        getCommandMenuItemLabel(addToFavoritesCommandMenuItem?.label),
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
      <CommandMenuContext.Provider
        value={{
          isInSidePanel: false,
          containerType: 'command-menu-list',
          displayType: 'dropdownItem',
          commandMenuItems: [],
        }}
      >
        <Story />
      </CommandMenuContext.Provider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByText(
        getCommandMenuItemLabel(addToFavoritesCommandMenuItem?.label),
      ),
    );
    expect(addToFavoritesMock).toHaveBeenCalled();
  },
};
