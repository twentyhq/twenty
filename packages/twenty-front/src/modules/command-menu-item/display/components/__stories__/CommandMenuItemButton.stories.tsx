import { CommandMenuItemButton } from '@/command-menu-item/display/components/CommandMenuItemButton';
import { NoSelectionRecordCommandKeys } from '@/command-menu-item/record/no-selection/types/NoSelectionRecordCommandKeys';
import { SingleRecordCommandKeys } from '@/command-menu-item/record/single-record/types/SingleRecordCommandKeys';
import { createMockCommandMenuItems } from '@/command-menu-item/mock/command-menu-items.mock';
import { getCommandMenuItemLabel } from '@/command-menu-item/utils/getCommandMenuItemLabel';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof CommandMenuItemButton> = {
  title: 'Modules/CommandMenuItem/Display/CommandMenuItemButton',
  component: CommandMenuItemButton,
  decorators: [ComponentDecorator, RouterDecorator],
};

export default meta;

type Story = StoryObj<typeof CommandMenuItemButton>;

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

export const Default: Story = {
  args: {
    action: addToFavoritesCommandMenuItem,
    onClick: addToFavoritesMock,
  },
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

export const WithLink: Story = {
  args: {
    action: goToPeopleCommandMenuItem,
    to: '/objects/people',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const menuItem = await canvas.findByText(
      getCommandMenuItemLabel(goToPeopleCommandMenuItem?.shortLabel),
    );
    expect(menuItem).toBeVisible();
    expect(canvas.getByRole('link')).toHaveAttribute('href', '/objects/people');
  },
};
