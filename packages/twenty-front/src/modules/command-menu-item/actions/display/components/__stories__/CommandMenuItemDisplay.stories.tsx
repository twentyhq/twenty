import { CommandMenuItemDisplay } from '@/command-menu-item/actions/display/components/CommandMenuItemDisplay';
import { SingleRecordActionKeys } from '@/command-menu-item/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { CommandMenuItemConfigContext } from '@/command-menu-item/contexts/CommandMenuItemConfigContext';
import { CommandMenuItemContext } from '@/command-menu-item/contexts/CommandMenuItemContext';
import { createMockActionMenuActions } from '@/command-menu-item/mock/action-menu-actions.mock';
import { getActionLabel } from '@/command-menu-item/utils/getActionLabel';
import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';

type Story = StoryObj<typeof CommandMenuItemDisplay>;

const deleteMock = fn();
const addToFavoritesMock = fn();

const mockActions = createMockActionMenuActions({
  deleteMock,
  addToFavoritesMock,
});

const addToFavoritesAction = mockActions.find(
  (action) => action.key === SingleRecordActionKeys.ADD_TO_FAVORITES,
);

if (!addToFavoritesAction) {
  throw new Error('addToFavoritesAction not found');
}

const meta: Meta<typeof CommandMenuItemDisplay> = {
  title: 'Modules/ActionMenu/Actions/Display/CommandMenuItemDisplay',
  component: CommandMenuItemDisplay,
  decorators: [
    (Story) => (
      <CommandMenuItemConfigContext.Provider value={addToFavoritesAction}>
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
        getActionLabel(addToFavoritesAction?.shortLabel ?? ''),
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
        getActionLabel(addToFavoritesAction?.label ?? ''),
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
        getActionLabel(addToFavoritesAction?.label ?? ''),
      ),
    );
    expect(addToFavoritesMock).toHaveBeenCalled();
  },
};
