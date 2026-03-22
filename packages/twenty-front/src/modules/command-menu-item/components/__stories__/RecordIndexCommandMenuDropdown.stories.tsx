import { type Meta, type StoryObj } from '@storybook/react-vite';
import { Provider as JotaiProvider } from 'jotai';
import * as test from 'storybook/test';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { RecordIndexCommandMenuDropdown } from '@/command-menu-item/components/RecordIndexCommandMenuDropdown';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { createMockCommandMenuItems } from '@/command-menu-item/mock/command-menu-items.mock';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { recordIndexCommandMenuDropdownPositionComponentState } from '@/command-menu-item/states/recordIndexCommandMenuDropdownPositionComponentState';

import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { RouterDecorator } from 'twenty-ui/testing';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';

const deleteMock = test.fn();
const addToFavoritesMock = test.fn();
const exportMock = test.fn();

const meta: Meta<typeof RecordIndexCommandMenuDropdown> = {
  title: 'Modules/CommandMenu/RecordIndexCommandMenuDropdown',
  component: RecordIndexCommandMenuDropdown,
  decorators: [
    (Story) => {
      jotaiStore.set(
        isDropdownOpenComponentState.atomFamily({
          instanceId: 'command-menu-dropdown-story-command-menu',
        }),
        true,
      );
      jotaiStore.set(
        recordIndexCommandMenuDropdownPositionComponentState.atomFamily({
          instanceId: 'command-menu-dropdown-story',
        }),
        { x: 10, y: 10 },
      );

      return (
        <JotaiProvider store={jotaiStore}>
          <CommandMenuComponentInstanceContext.Provider
            value={{ instanceId: 'story-command-menu' }}
          >
            <CommandMenuContext.Provider
              value={{
                isInSidePanel: true,
                displayType: 'dropdownItem',
                containerType: 'index-page-dropdown',
                commandMenuItems: createMockCommandMenuItems({
                  deleteMock,
                  addToFavoritesMock,
                  exportMock,
                }),
              }}
            >
              <Story />
            </CommandMenuContext.Provider>
          </CommandMenuComponentInstanceContext.Provider>
        </JotaiProvider>
      );
    },
    ContextStoreDecorator,
    RouterDecorator,
  ],
};

export default meta;

type Story = StoryObj<typeof RecordIndexCommandMenuDropdown>;

export const Default: Story = {
  args: {
    commandMenuId: 'story',
  },
};

export const WithInteractions: Story = {
  args: {
    commandMenuId: 'story',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    const deleteButton = await canvas.findByText('Delete');
    await userEvent.click(deleteButton);

    const addToFavoritesButton = await canvas.findByText('Add to favorites');
    await userEvent.click(addToFavoritesButton);

    const exportButton = await canvas.findByText('Export');
    await userEvent.click(exportButton);

    const moreActionsButton = await canvas.findByText('More actions');

    await waitFor(() => {
      expect(deleteMock).toHaveBeenCalled();
      expect(addToFavoritesMock).toHaveBeenCalled();
      expect(exportMock).toHaveBeenCalled();
      expect(moreActionsButton).toBeInTheDocument();
    });
  },
};
