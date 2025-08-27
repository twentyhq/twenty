import { type Meta, type StoryObj } from '@storybook/react';
import { expect, within } from '@storybook/test';

import { ActionComponent } from '@/action-menu/actions/display/components/ActionComponent';
import { SingleRecordActionKeys } from '@/action-menu/actions/record-actions/single-record/types/SingleRecordActionsKey';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { createMockActionMenuActions } from '@/action-menu/mock/action-menu-actions.mock';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { getActionLabel } from '@/action-menu/utils/getActionLabel';
import { ComponentDecorator } from 'twenty-ui/testing';

const mockActions = createMockActionMenuActions({});

const addToFavoritesAction = mockActions.find(
  (action) => action.key === SingleRecordActionKeys.ADD_TO_FAVORITES,
);

if (!addToFavoritesAction) {
  throw new Error('Add to favorites action not found');
}

const meta: Meta<typeof ActionComponent> = {
  title: 'Modules/ActionMenu/Actions/Display/ActionComponent',
  component: ActionComponent,
  decorators: [
    ComponentDecorator,
    (Story) => (
      <ActionMenuComponentInstanceContext.Provider
        value={{ instanceId: 'story' }}
      >
        <ActionMenuContext.Provider
          value={{
            isInRightDrawer: false,
            actionMenuType: 'index-page-action-menu',
            displayType: 'button',
            actions: [addToFavoritesAction],
          }}
        >
          <Story />
        </ActionMenuContext.Provider>
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
type Story = StoryObj<typeof ActionComponent>;

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
