import { NoSelectionRecordActionKeys } from '@/action-menu/actions/record-actions/no-selection/types/NoSelectionRecordActionsKeys';
import { SingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { createMockActionMenuActions } from '@/action-menu/mock/action-menu-actions.mock';
import { getActionLabel } from '@/action-menu/utils/getActionLabel';
import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { expect, fn, userEvent, within } from '@storybook/test';
import { type Meta, type StoryObj } from '@storybook/react';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';
import { ActionListItem } from '@/action-menu/actions/display/components/ActionListItem';

type Story = StoryObj<typeof ActionListItem>;

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

const meta: Meta<typeof ActionListItem> = {
  title: 'Modules/ActionMenu/Actions/Display/ActionListItem',
  component: ActionListItem,
  decorators: [
    (Story) => (
      <SelectableListComponentInstanceContext.Provider
        value={{ instanceId: 'story' }}
      >
        <Story />
      </SelectableListComponentInstanceContext.Provider>
    ),
    ComponentDecorator,
    RouterDecorator,
  ],
};

export default meta;

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
    const listItem = await canvas.findByText(
      getActionLabel(goToPeopleAction?.label ?? ''),
    );
    expect(listItem).toBeVisible();
  },
};
