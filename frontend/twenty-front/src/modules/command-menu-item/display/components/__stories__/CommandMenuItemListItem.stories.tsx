import { CommandListItem } from '@/command-menu-item/display/components/CommandListItem';
import { createMockCommandMenuItems } from '@/command-menu-item/mock/command-menu-items.mock';
import { NoSelectionRecordCommandKeys } from '@/command-menu-item/record/no-selection/types/NoSelectionRecordCommandKeys';
import { SingleRecordCommandKeys } from '@/command-menu-item/record/single-record/types/SingleRecordCommandKeys';
import { getCommandMenuItemLabel } from '@/command-menu-item/utils/getCommandMenuItemLabel';
import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';

type Story = StoryObj<typeof CommandListItem>;

const deleteMock = fn();
const addToFavoritesMock = fn();

const mockActions = createMockCommandMenuItems({
  deleteMock,
  addToFavoritesMock,
});

const addToFavoritesCommandMenuItem = mockActions.find(
  (action) => action.key === SingleRecordCommandKeys.ADD_TO_FAVORITES,
);

const goToPeopleCommandMenuItem = mockActions.find(
  (action) => action.key === NoSelectionRecordCommandKeys.GO_TO_PEOPLE,
);

const meta: Meta<typeof CommandListItem> = {
  title: 'Modules/CommandMenuItem/Display/CommandListItem',
  component: CommandListItem,
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
    action: addToFavoritesCommandMenuItem,
    onClick: addToFavoritesMock,
  },
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

export const WithLink: Story = {
  args: {
    action: goToPeopleCommandMenuItem,
    to: '/objects/people',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const listItem = await canvas.findByText(
      getCommandMenuItemLabel(goToPeopleCommandMenuItem?.label),
    );
    expect(listItem).toBeVisible();
  },
};
