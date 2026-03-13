import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { CommandMenuItemComponent } from '@/command-menu-item/display/components/CommandMenuItemComponent';
import { SingleRecordCommandKeys } from '@/command-menu-item/record/single-record/types/SingleRecordCommandKeys';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { createMockCommandMenuItems } from '@/command-menu-item/mock/command-menu-items.mock';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { getCommandMenuItemLabel } from '@/command-menu-item/utils/getCommandMenuItemLabel';
import { ComponentDecorator } from 'twenty-ui/testing';

const mockActions = createMockCommandMenuItems({});

const addToFavoritesCommandMenuItem = mockActions.find(
  (action) => action.key === SingleRecordCommandKeys.ADD_TO_FAVORITES,
);

if (!addToFavoritesCommandMenuItem) {
  throw new Error('Add to favorites action not found');
}

const meta: Meta<typeof CommandMenuItemComponent> = {
  title: 'Modules/CommandMenuItem/Display/CommandMenuItemComponent',
  component: CommandMenuItemComponent,
  decorators: [
    ComponentDecorator,
    (Story) => (
      <CommandMenuComponentInstanceContext.Provider
        value={{ instanceId: 'story' }}
      >
        <CommandMenuContext.Provider
          value={{
            isInSidePanel: false,
            containerType: 'index-page-header',
            displayType: 'button',
            commandMenuItems: [addToFavoritesCommandMenuItem],
          }}
        >
          <Story />
        </CommandMenuContext.Provider>
      </CommandMenuComponentInstanceContext.Provider>
    ),
  ],
  args: {
    action: addToFavoritesCommandMenuItem,
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
        getCommandMenuItemLabel(
          addToFavoritesCommandMenuItem?.shortLabel ?? '',
        ),
      ),
    ).toBeVisible();
  },
};
