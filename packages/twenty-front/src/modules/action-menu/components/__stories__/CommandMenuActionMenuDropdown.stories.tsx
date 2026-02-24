import { type Meta, type StoryObj } from '@storybook/react-vite';
import { Provider as JotaiProvider } from 'jotai';
import * as test from 'storybook/test';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { CommandMenuActionMenuDropdown } from '@/action-menu/components/CommandMenuActionMenuDropdown';
import { ActionMenuContext } from '@/action-menu/contexts/ActionMenuContext';
import { createMockActionMenuActions } from '@/action-menu/mock/action-menu-actions.mock';
import { ActionMenuComponentInstanceContext } from '@/action-menu/states/contexts/ActionMenuComponentInstanceContext';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { JestContextStoreSetter } from '~/testing/jest/JestContextStoreSetter';
const deleteMock = test.fn();
const addToFavoritesMock = test.fn();
const exportMock = test.fn();

const meta: Meta<typeof CommandMenuActionMenuDropdown> = {
  title: 'Modules/ActionMenu/CommandMenuActionMenuDropdown',
  component: CommandMenuActionMenuDropdown,
  decorators: [
    (Story) => (
      <JotaiProvider store={jotaiStore}>
        <ContextStoreComponentInstanceContext.Provider
          value={{ instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID }}
        >
          <JestContextStoreSetter
            contextStoreTargetedRecordsRule={{
              mode: 'selection',
              selectedRecordIds: ['1'],
            }}
            contextStoreNumberOfSelectedRecords={1}
          >
            <ActionMenuComponentInstanceContext.Provider
              value={{ instanceId: 'story-action-menu' }}
            >
              <ActionMenuContext.Provider
                value={{
                  isInRightDrawer: true,
                  displayType: 'dropdownItem',
                  actionMenuType: 'command-menu-show-page-action-menu-dropdown',
                  actions: createMockActionMenuActions({
                    deleteMock,
                    addToFavoritesMock,
                    exportMock,
                  }),
                }}
              >
                <Story />
              </ActionMenuContext.Provider>
            </ActionMenuComponentInstanceContext.Provider>
          </JestContextStoreSetter>
        </ContextStoreComponentInstanceContext.Provider>
      </JotaiProvider>
    ),
    ComponentDecorator,
    ContextStoreDecorator,
    ObjectMetadataItemsDecorator,
    SnackBarDecorator,
    RouterDecorator,
  ],
  args: {
    actionMenuId: 'story-action-menu',
  },
};

export default meta;

type Story = StoryObj<typeof CommandMenuActionMenuDropdown>;

export const Default: Story = {
  args: {
    actionMenuId: 'story-action-menu',
  },
};

export const WithButtonClicks: Story = {
  args: {
    actionMenuId: 'story-action-menu',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    let actionButton = await canvas.findByText('Options');
    await userEvent.click(actionButton);

    const deleteButton = await canvas.findByText('Delete');
    await userEvent.click(deleteButton);

    actionButton = await canvas.findByText('Options');
    await userEvent.click(actionButton);

    const addToFavoritesButton = await canvas.findByText('Add to favorites');
    await userEvent.click(addToFavoritesButton);

    actionButton = await canvas.findByText('Options');
    await userEvent.click(actionButton);

    const exportButton = await canvas.findByText('Export');
    await userEvent.click(exportButton);

    await waitFor(() => {
      expect(deleteMock).toHaveBeenCalled();
      expect(addToFavoritesMock).toHaveBeenCalled();
      expect(exportMock).toHaveBeenCalled();
    });
  },
};
