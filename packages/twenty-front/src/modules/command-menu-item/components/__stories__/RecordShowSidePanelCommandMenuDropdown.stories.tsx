import { type Meta, type StoryObj } from '@storybook/react-vite';
import { Provider as JotaiProvider } from 'jotai';
import { userEvent, within } from 'storybook/test';

import { RecordPageSidePanelCommandMenuDropdown } from '@/command-menu-item/components/RecordPageSidePanelCommandMenuDropdown';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { createMockCommandMenuItems } from '@/command-menu-item/mock/command-menu-items.mock';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { EMPTY_COMMAND_MENU_CONTEXT_API } from '@/command-menu-item/constants/EmptyCommandMenuContextApi';
import { ComponentDecorator, RouterDecorator } from 'twenty-ui/testing';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';
import { JestContextStoreSetter } from '~/testing/jest/JestContextStoreSetter';

const meta: Meta<typeof RecordPageSidePanelCommandMenuDropdown> = {
  title: 'Modules/CommandMenu/RecordPageSidePanelCommandMenuDropdown',
  component: RecordPageSidePanelCommandMenuDropdown,
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
            <CommandMenuComponentInstanceContext.Provider
              value={{ instanceId: 'story-command-menu' }}
            >
              <CommandMenuContext.Provider
                value={{
                  displayType: 'dropdownItem',
                  containerType: 'command-menu-show-page-dropdown',
                  commandMenuItems: createMockCommandMenuItems(),
                  commandMenuContextApi: {
                    ...EMPTY_COMMAND_MENU_CONTEXT_API,
                    isInSidePanel: true,
                  },
                }}
              >
                <Story />
              </CommandMenuContext.Provider>
            </CommandMenuComponentInstanceContext.Provider>
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
    commandMenuId: 'story-command-menu',
  },
};

export default meta;

type Story = StoryObj<typeof RecordPageSidePanelCommandMenuDropdown>;

export const Default: Story = {
  args: {
    commandMenuId: 'story-command-menu',
  },
};

export const WithButtonClicks: Story = {
  args: {
    commandMenuId: 'story-command-menu',
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
  },
};
