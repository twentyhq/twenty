import { SingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { createMockActionMenuActions } from '@/action-menu/mock/action-menu-actions.mock';
import { getActionLabel } from '@/action-menu/utils/getActionLabel';
import { SelectableListScope } from '@/ui/layout/selectable-list/scopes/SelectableListScope';
import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within } from '@storybook/test';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';
import { ActionDisplay } from '../ActionDisplay';

const meta: Meta<typeof ActionDisplay> = {
  title: 'Modules/ActionMenu/Actions/Display/ActionDisplay',
  component: ActionDisplay,
  decorators: [ComponentDecorator, RouterDecorator],
};

export default meta;

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

export const AsButton: Story = {
  args: {
    action: addToFavoritesAction,
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
      canvas.getByText(getActionLabel(addToFavoritesAction?.shortLabel ?? '')),
    );
    expect(addToFavoritesMock).toHaveBeenCalled();
  },
};

export const AsListItem: Story = {
  args: {
    action: addToFavoritesAction,
    onClick: addToFavoritesMock,
  },
  decorators: [
    (Story) => (
      <ActionMenuContext.Provider
        value={{
          isInRightDrawer: false,
          actionMenuType: 'command-menu',
          displayType: 'listItem',
          actions: [],
        }}
      >
        <SelectableListScope selectableListScopeId={'test'}>
          <Story />
        </SelectableListScope>
      </ActionMenuContext.Provider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByText(getActionLabel(addToFavoritesAction?.label ?? '')),
    );
    expect(addToFavoritesMock).toHaveBeenCalled();
  },
};

export const AsDropdownItem: Story = {
  args: {
    action: addToFavoritesAction,
    onClick: addToFavoritesMock,
  },
  decorators: [
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
      canvas.getByText(getActionLabel(addToFavoritesAction?.label ?? '')),
    );
    expect(addToFavoritesMock).toHaveBeenCalled();
  },
};
