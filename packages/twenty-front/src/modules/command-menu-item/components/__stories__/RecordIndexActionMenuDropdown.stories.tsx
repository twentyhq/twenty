import { type Meta, type StoryObj } from '@storybook/react-vite';
import { Provider as JotaiProvider } from 'jotai';
import * as test from 'storybook/test';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { RecordIndexActionMenuDropdown } from '@/command-menu-item/components/RecordIndexActionMenuDropdown';
import { CommandMenuItemContext } from '@/command-menu-item/contexts/CommandMenuItemContext';
import { createMockActionMenuActions } from '@/command-menu-item/mock/action-menu-actions.mock';
import { ActionMenuComponentInstanceContext } from '@/command-menu-item/states/contexts/ActionMenuComponentInstanceContext';
import { recordIndexActionMenuDropdownPositionComponentState } from '@/command-menu-item/states/recordIndexActionMenuDropdownPositionComponentState';

import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { RouterDecorator } from 'twenty-ui/testing';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';

const deleteMock = test.fn();
const addToFavoritesMock = test.fn();
const exportMock = test.fn();

const meta: Meta<typeof RecordIndexActionMenuDropdown> = {
  title: 'Modules/ActionMenu/RecordIndexActionMenuDropdown',
  component: RecordIndexActionMenuDropdown,
  decorators: [
    (Story) => {
      jotaiStore.set(
        isDropdownOpenComponentState.atomFamily({
          instanceId: 'action-menu-dropdown-story-action-menu',
        }),
        true,
      );
      jotaiStore.set(
        recordIndexActionMenuDropdownPositionComponentState.atomFamily({
          instanceId: 'action-menu-dropdown-story',
        }),
        { x: 10, y: 10 },
      );

      return (
        <JotaiProvider store={jotaiStore}>
          <ActionMenuComponentInstanceContext.Provider
            value={{ instanceId: 'story-action-menu' }}
          >
            <CommandMenuItemContext.Provider
              value={{
                isInSidePanel: true,
                displayType: 'dropdownItem',
                actionMenuType: 'index-page-action-menu-dropdown',
                actions: createMockActionMenuActions({
                  deleteMock,
                  addToFavoritesMock,
                  exportMock,
                }),
              }}
            >
              <Story />
            </CommandMenuItemContext.Provider>
          </ActionMenuComponentInstanceContext.Provider>
        </JotaiProvider>
      );
    },
    ContextStoreDecorator,
    RouterDecorator,
  ],
};

export default meta;

type Story = StoryObj<typeof RecordIndexActionMenuDropdown>;

export const Default: Story = {
  args: {
    actionMenuId: 'story',
  },
};

export const WithInteractions: Story = {
  args: {
    actionMenuId: 'story',
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
