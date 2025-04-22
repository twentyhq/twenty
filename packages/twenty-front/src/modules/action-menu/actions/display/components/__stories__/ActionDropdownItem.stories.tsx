import { NoSelectionRecordActionKeys } from '@/action-menu/actions/record-actions/no-selection/types/NoSelectionRecordActionsKeys';
import { SingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { createMockActionMenuActions } from '@/action-menu/mock/action-menu-actions.mock';
import { getActionLabel } from '@/action-menu/utils/getActionLabel';
import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { fn, userEvent, within } from '@storybook/test';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';
import { ActionDropdownItem } from '../ActionDropdownItem';

const meta: Meta<typeof ActionDropdownItem> = {
  title: 'Modules/ActionMenu/Actions/Display/ActionDropdownItem',
  component: ActionDropdownItem,
  decorators: [ComponentDecorator, RouterDecorator],
};

export default meta;

type Story = StoryObj<typeof ActionDropdownItem>;

const deleteMock = fn();
const addToFavoritesMock = fn();

const mockActions = createMockActionMenuActions({
  deleteMock,
  addToFavoritesMock,
});

const addToFavoritesAction = mockActions.find(
  (action) => action.key === SingleRecordActionKeys.ADD_TO_FAVORITES,
);

const goToPeopleAction = mockActions.find(
  (action) => action.key === NoSelectionRecordActionKeys.GO_TO_PEOPLE,
);

export const Default: Story = {
  args: {
    action: addToFavoritesAction,
    onClick: addToFavoritesMock,
  },
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

export const WithLink: Story = {
  args: {
    action: goToPeopleAction,
    to: '/objects/people',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dropdownItem = await canvas.findByText(
      getActionLabel(goToPeopleAction?.label ?? ''),
    );
    expect(dropdownItem).toBeVisible();
  },
};
