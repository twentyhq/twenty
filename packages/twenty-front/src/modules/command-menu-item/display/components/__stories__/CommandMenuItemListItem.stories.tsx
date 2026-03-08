import { CommandMenuItemListItem } from '@/command-menu-item/display/components/CommandMenuItemListItem';
import { NoSelectionRecordActionKeys } from '@/command-menu-item/record/no-selection/types/NoSelectionRecordActionsKeys';
import { SingleRecordActionKeys } from '@/command-menu-item/record/single-record/types/SingleRecordActionsKey';
import { createMockActionMenuActions } from '@/command-menu-item/mock/action-menu-actions.mock';
import { getActionLabel } from '@/command-menu-item/utils/getActionLabel';
import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';

type Story = StoryObj<typeof CommandMenuItemListItem>;

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

const meta: Meta<typeof CommandMenuItemListItem> = {
  title: 'Modules/ActionMenu/Actions/Display/CommandMenuItemListItem',
  component: CommandMenuItemListItem,
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
