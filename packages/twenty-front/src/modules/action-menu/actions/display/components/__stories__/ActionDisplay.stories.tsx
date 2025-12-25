import { SingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { ActionConfigContext } from '@/action-menu/contexts/ActionConfigContext';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { createMockActionMenuActions } from '@/action-menu/mock/action-menu-actions.mock';
import { getActionLabel } from '@/action-menu/utils/getActionLabel';
import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { expect, fn, userEvent, within } from '@storybook/test';
import { type Meta, type StoryObj } from '@storybook/react';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';
import { ActionDisplay } from '@/action-menu/actions/display/components/ActionDisplay';

type Story = StoryObj<typeof ActionDisplay>;

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

const meta: Meta<typeof ActionDisplay> = {
  title: 'Modules/ActionMenu/Actions/Display/ActionDisplay',
  component: ActionDisplay,
  decorators: [
    (Story) => (
      <ActionConfigContext.Provider value={addToFavoritesAction}>
        <Story />
      </ActionConfigContext.Provider>
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
      <ActionMenuContext.Provider
        value={{
          isInRightDrawer: false,
          actionMenuType: 'command-menu',
          displayType: 'button',
          actions: [],
        }}
      >
        <Story />
      </ActionMenuContext.Provider>
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
      <ActionMenuContext.Provider
        value={{
          isInRightDrawer: false,
          actionMenuType: 'command-menu',
          displayType: 'listItem',
          actions: [],
        }}
      >
        <Story />
      </ActionMenuContext.Provider>
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
      <ActionMenuContext.Provider
        value={{
          isInRightDrawer: false,
          actionMenuType: 'command-menu',
          displayType: 'dropdownItem',
          actions: [],
        }}
      >
        <Story />
      </ActionMenuContext.Provider>
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
