import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { CommandMenuItemComponent } from '@/command-menu-item/display/components/CommandMenuItemComponent';
import { SingleRecordActionKeys } from '@/command-menu-item/record/single-record/types/SingleRecordActionsKey';
import { CommandMenuItemContext } from '@/command-menu-item/contexts/CommandMenuItemContext';
import { createMockActionMenuActions } from '@/command-menu-item/mock/action-menu-actions.mock';
import { ActionMenuComponentInstanceContext } from '@/command-menu-item/states/contexts/ActionMenuComponentInstanceContext';
import { getActionLabel } from '@/command-menu-item/utils/getActionLabel';
import { ComponentDecorator } from 'twenty-ui/testing';

const mockActions = createMockActionMenuActions({});

const addToFavoritesAction = mockActions.find(
  (action) => action.key === SingleRecordActionKeys.ADD_TO_FAVORITES,
);

if (!addToFavoritesAction) {
  throw new Error('Add to favorites action not found');
}

const meta: Meta<typeof CommandMenuItemComponent> = {
  title: 'Modules/ActionMenu/Actions/Display/CommandMenuItemComponent',
  component: CommandMenuItemComponent,
  decorators: [
    ComponentDecorator,
    (Story) => (
      <ActionMenuComponentInstanceContext.Provider
        value={{ instanceId: 'story' }}
      >
        <CommandMenuItemContext.Provider
          value={{
            isInSidePanel: false,
            actionMenuType: 'index-page-action-menu',
            displayType: 'button',
            actions: [addToFavoritesAction],
          }}
        >
          <Story />
        </CommandMenuItemContext.Provider>
      </ActionMenuComponentInstanceContext.Provider>
    ),
  ],
  args: {
    action: addToFavoritesAction,
  },
  parameters: {
    container: {
      width: 'auto',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CommandMenuItemComponent>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        getActionLabel(addToFavoritesAction?.shortLabel ?? ''),
      ),
    ).toBeVisible();
  },
};
