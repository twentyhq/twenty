import { CommandMenuItemButton } from '@/command-menu-item/actions/display/components/CommandMenuItemButton';
import { NoSelectionRecordActionKeys } from '@/command-menu-item/actions/record-actions/no-selection/types/NoSelectionRecordActionsKeys';
import { SingleRecordActionKeys } from '@/command-menu-item/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { createMockActionMenuActions } from '@/command-menu-item/mock/action-menu-actions.mock';
import { getActionLabel } from '@/command-menu-item/utils/getActionLabel';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';

const meta: Meta<typeof CommandMenuItemButton> = {
  title: 'Modules/ActionMenu/Actions/Display/CommandMenuItemButton',
  component: CommandMenuItemButton,
  decorators: [ComponentDecorator, RouterDecorator],
};

export default meta;

type Story = StoryObj<typeof CommandMenuItemButton>;

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
        getActionLabel(addToFavoritesAction?.shortLabel ?? ''),
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
    const menuItem = await canvas.findByText(
      getActionLabel(goToPeopleAction?.shortLabel ?? ''),
    );
    expect(menuItem).toBeVisible();
    expect(canvas.getByRole('link')).toHaveAttribute('href', '/objects/people');
  },
};
