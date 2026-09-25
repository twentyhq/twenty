import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { RecordPageSidePanelCommandMenuDropdown } from '@/command-menu-item/components/RecordPageSidePanelCommandMenuDropdown';
import { EMPTY_COMMAND_MENU_CONTEXT_API } from '@/command-menu-item/constants/EmptyCommandMenuContextApi';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { headlessCommandContextApisState } from '@/command-menu-item/engine-command/states/headlessCommandContextApisState';
import { createMockCommandMenuItems } from '@/command-menu-item/mock/command-menu-items.mock';
import { commandMenuItemProgressFamilyState } from '@/command-menu-item/states/commandMenuItemProgressFamilyState';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { getSidePanelCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getSidePanelCommandMenuDropdownIdFromCommandMenuId';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { JestContextStoreSetter } from '~/testing/jest/JestContextStoreSetter';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const COMMAND_MENU_ID = 'story-command-menu';
const EXPORT_COMMAND_ID = 'mock-export';

const meta: Meta<typeof RecordPageSidePanelCommandMenuDropdown> = {
  title: 'Modules/CommandMenu/RecordPageSidePanelCommandMenuDropdown',
  component: RecordPageSidePanelCommandMenuDropdown,
  decorators: [
    (Story) => (
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
            value={{ instanceId: COMMAND_MENU_ID }}
          >
            <CommandMenuContext.Provider
              value={{
                displayType: 'dropdownItem',
                containerType:
                  CommandMenuItemContainerType.CommandMenuShowPageDropdown,
                commandMenuItems: createMockCommandMenuItems().map((item) => ({
                  ...item,
                  isPinned: false,
                })),
                commandMenuContextApi: {
                  ...EMPTY_COMMAND_MENU_CONTEXT_API,
                  isInSidePanel: true,
                },
                isInPreviewMode: false,
              }}
            >
              <Story />
            </CommandMenuContext.Provider>
          </CommandMenuComponentInstanceContext.Provider>
        </JestContextStoreSetter>
      </ContextStoreComponentInstanceContext.Provider>
    ),
    ComponentDecorator,
    ContextStoreDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
    MemoryRouterDecorator,
  ],
  beforeEach: () => {
    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      featureFlags: [
        {
          key: FeatureFlagKey.IS_ASYNC_CSV_EXPORT_ENABLED,
          value: true,
        },
      ],
    });
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OrdinaryCommandClosesDropdown: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole('button', { name: 'Options' });

    await userEvent.click(trigger);
    expect(
      canvas.queryByRole('menuitem', { name: 'Go to People' }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      await canvas.findByRole('menuitem', { name: 'Add to favorites' }),
    );

    await waitFor(() => {
      expect(canvas.queryByRole('menu')).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    });
    expect(
      jotaiStore
        .get(headlessCommandContextApisState.atom)
        .has('mock-add-to-favorites'),
    ).toBe(true);
    expect(jotaiStore.get(headlessCommandContextApisState.atom).size).toBe(1);
    expect(
      jotaiStore.get(
        isDropdownOpenComponentState.atomFamily({
          instanceId:
            getSidePanelCommandMenuDropdownIdFromCommandMenuId(COMMAND_MENU_ID),
        }),
      ),
    ).toBe(false);
  },
};

export const AsyncExportShowsProgressAndPreventsRepeatedExecution: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Options' }),
    );
    await userEvent.click(
      await canvas.findByRole('menuitem', { name: 'Export' }),
    );

    const mountedCommands = jotaiStore.get(
      headlessCommandContextApisState.atom,
    );
    expect(mountedCommands.has(EXPORT_COMMAND_ID)).toBe(true);
    expect(mountedCommands.size).toBe(1);
    expect(canvas.getByRole('menu')).toBeVisible();
    expect(
      jotaiStore.get(
        isDropdownOpenComponentState.atomFamily({
          instanceId:
            getSidePanelCommandMenuDropdownIdFromCommandMenuId(COMMAND_MENU_ID),
        }),
      ),
    ).toBe(true);

    jotaiStore.set(
      commandMenuItemProgressFamilyState.atomFamily(EXPORT_COMMAND_ID),
      37,
    );

    const exportAction = await canvas.findByRole('menuitem', {
      name: /Export 37%/,
    });
    expect(exportAction).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(exportAction);

    expect(jotaiStore.get(headlessCommandContextApisState.atom)).toBe(
      mountedCommands,
    );
    expect(canvas.getByRole('menu')).toBeVisible();
  },
};
