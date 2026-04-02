import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';

import { CommandDropdownItem } from '@/command-menu-item/display/components/CommandDropdownItem';
import { createMockCommandMenuItems } from '@/command-menu-item/mock/command-menu-items.mock';
import { getCommandMenuItemLabel } from '@/command-menu-item/utils/getCommandMenuItemLabel';
import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { EngineComponentKey } from '~/generated-metadata/graphql';

const meta: Meta<typeof CommandDropdownItem> = {
  title: 'Modules/CommandMenuItem/Display/CommandDropdownItem',
  component: CommandDropdownItem,
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

type Story = StoryObj<typeof CommandDropdownItem>;

const deleteMock = fn();
const addToFavoritesMock = fn();

const mockActions = createMockCommandMenuItems({
  deleteMock,
  addToFavoritesMock,
});

const addToFavoritesCommandMenuItem = mockActions.find(
  (action) => action.key === EngineComponentKey.ADD_TO_FAVORITES,
);

const goToPeopleCommandMenuItem = mockActions.find(
  (action) => action.key === EngineComponentKey.GO_TO_PEOPLE,
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
    const dropdownItem = await canvas.findByText(
      getCommandMenuItemLabel(goToPeopleCommandMenuItem?.label),
    );
    expect(dropdownItem).toBeVisible();
  },
};
