import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { Provider as JotaiProvider } from 'jotai';
import { expect, within } from 'storybook/test';

import { RecordIndexCommandMenuDropdown } from '@/command-menu-item/components/RecordIndexCommandMenuDropdown';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { createMockCommandMenuItems } from '@/command-menu-item/mock/command-menu-items.mock';
import { recordIndexCommandMenuDropdownPositionComponentState } from '@/command-menu-item/states/recordIndexCommandMenuDropdownPositionComponentState';
import { recordIndexCommandMenuDropdownTargetCellComponentState } from '@/command-menu-item/states/recordIndexCommandMenuDropdownTargetCellComponentState';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';

import { textfieldDefinition } from '@/object-record/record-field/ui/__mocks__/fieldDefinitions';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { EMPTY_COMMAND_MENU_CONTEXT_API } from '@/command-menu-item/constants/EmptyCommandMenuContextApi';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

const DROPDOWN_INSTANCE_ID = 'command-menu-dropdown-story-command-menu';

const meta: Meta<typeof RecordIndexCommandMenuDropdown> = {
  title: 'Modules/CommandMenu/RecordIndexCommandMenuDropdown',
  component: RecordIndexCommandMenuDropdown,
  decorators: [
    (Story) => {
      jotaiStore.set(
        isDropdownOpenComponentState.atomFamily({
          instanceId: DROPDOWN_INSTANCE_ID,
        }),
        true,
      );
      jotaiStore.set(
        recordIndexCommandMenuDropdownTargetCellComponentState.atomFamily({
          instanceId: DROPDOWN_INSTANCE_ID,
        }),
        null,
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
                displayType: 'dropdownItem',
                containerType: CommandMenuItemContainerType.IndexPageDropdown,
                commandMenuItems: createMockCommandMenuItems(),
                commandMenuContextApi: EMPTY_COMMAND_MENU_CONTEXT_API,
                isInPreviewMode: false,
              }}
            >
              <Story />
            </CommandMenuContext.Provider>
          </CommandMenuComponentInstanceContext.Provider>
        </JotaiProvider>
      );
    },
    ContextStoreDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
    MemoryRouterDecorator,
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
    const addToFavoritesButton = await canvas.findByText('Add to favorites');
    const exportButton = await canvas.findByText('Export');
    const moreActionsButton = await canvas.findByText('More actions');

    expect(deleteButton).toBeInTheDocument();
    expect(addToFavoritesButton).toBeInTheDocument();
    expect(exportButton).toBeInTheDocument();
    expect(moreActionsButton).toBeInTheDocument();
    expect(canvas.queryByText('Copy cell')).not.toBeInTheDocument();
  },
};

export const WithTargetCell: Story = {
  args: {
    commandMenuId: 'story',
  },
  decorators: [
    (Story) => {
      jotaiStore.set(recordStoreFamilyState.atomFamily('record-id'), {
        id: 'record-id',
        __typename: 'Person',
        userName: 'John Doe',
      });
      jotaiStore.set(
        recordIndexCommandMenuDropdownTargetCellComponentState.atomFamily({
          instanceId: DROPDOWN_INSTANCE_ID,
        }),
        { recordId: 'record-id', fieldDefinition: textfieldDefinition },
      );

      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    expect(await canvas.findByText('Copy cell')).toBeInTheDocument();
  },
};
