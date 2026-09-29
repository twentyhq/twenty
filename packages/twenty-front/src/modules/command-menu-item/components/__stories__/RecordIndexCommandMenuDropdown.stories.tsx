import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { RecordIndexCommandMenuDropdown } from '@/command-menu-item/components/RecordIndexCommandMenuDropdown';
import { EMPTY_COMMAND_MENU_CONTEXT_API } from '@/command-menu-item/constants/EmptyCommandMenuContextApi';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { headlessCommandContextApisState } from '@/command-menu-item/engine-command/states/headlessCommandContextApisState';
import { createMockCommandMenuItems } from '@/command-menu-item/mock/command-menu-items.mock';
import { commandMenuItemProgressFamilyState } from '@/command-menu-item/states/commandMenuItemProgressFamilyState';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { getCommandMenuDropdownIdFromCommandMenuId } from '@/command-menu-item/utils/getCommandMenuDropdownIdFromCommandMenuId';
import { getCommandMenuIdFromRecordIndexId } from '@/command-menu-item/utils/getCommandMenuIdFromRecordIndexId';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { useTriggerCommandMenuDropdown } from '@/object-record/record-table/record-table-cell/hooks/useTriggerCommandMenuDropdown';
import { isRowSelectedComponentFamilyState } from '@/object-record/record-table/record-table-row/states/isRowSelectedComponentFamilyState';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { currentFocusIdSelector } from '@/ui/utilities/focus/states/currentFocusIdSelector';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { Provider as JotaiProvider } from 'jotai';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  CommandMenuItemAvailabilityType,
  type CommandMenuItemFieldsFragment,
  EngineComponentKey,
  FeatureFlagKey,
} from '~/generated-metadata/graphql';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const RECORD_TABLE_ID = 'story-record-table';
const COMMAND_MENU_ID = getCommandMenuIdFromRecordIndexId(RECORD_TABLE_ID);
const COMMAND_MENU_DROPDOWN_ID =
  getCommandMenuDropdownIdFromCommandMenuId(COMMAND_MENU_ID);
const EXPORT_COMMAND_ID = 'mock-export';

const THIRD_PARTY_APPLICATION = {
  id: 'acme-sync-application',
  name: 'Acme Sync',
  universalIdentifier: 'acme-sync-application',
  logoUrl: null,
};

const THIRD_PARTY_COMMAND_MENU_ITEM: CommandMenuItemFieldsFragment = {
  __typename: 'CommandMenuItem',
  isActive: true,
  id: 'mock-sync-with-acme',
  applicationId: THIRD_PARTY_APPLICATION.id,
  workflowVersionId: null,
  frontComponentId: null,
  frontComponent: null,
  engineComponentKey: EngineComponentKey.ADD_TO_FAVORITES,
  label: 'Sync with Acme',
  icon: 'IconRefresh',
  shortLabel: 'Sync',
  position: 9,
  isPinned: false,
  hotKeys: null,
  conditionalAvailabilityExpression: null,
  availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
  availabilityObjectMetadataId: null,
  payload: null,
};

const COMMAND_MENU_ITEMS = [
  ...createMockCommandMenuItems(),
  THIRD_PARTY_COMMAND_MENU_ITEM,
];

const isRecordRowSelected = (recordId: string) =>
  jotaiStore.get(
    isRowSelectedComponentFamilyState.atomFamily({
      instanceId: RECORD_TABLE_ID,
      familyKey: recordId,
    }),
  );

const isCommandMenuDropdownOpen = () =>
  jotaiStore.get(
    isDropdownOpenComponentState.atomFamily({
      instanceId: COMMAND_MENU_DROPDOWN_ID,
    }),
  );

const rightClickRecord = async ({
  canvasElement,
  recordName,
  offset,
}: {
  canvasElement: HTMLElement;
  recordName: string;
  offset: number;
}) => {
  const cell = await within(canvasElement).findByRole(
    'cell',
    { name: recordName },
    { timeout: 3000 },
  );
  const cellRect = cell.getBoundingClientRect();
  const pointer = {
    clientX: Math.round(cellRect.left + offset),
    clientY: Math.round(cellRect.top + offset),
  };

  await userEvent.pointer({
    keys: '[MouseRight]',
    target: cell,
    coords: pointer,
  });

  return pointer;
};

const StoryRecordTable = () => {
  const { triggerCommandMenuDropdown } = useTriggerCommandMenuDropdown({
    recordTableId: RECORD_TABLE_ID,
  });

  return (
    <table>
      <tbody>
        {['Airbnb', 'Stripe'].map((recordName) => (
          <tr key={recordName}>
            <td
              onContextMenu={(event) =>
                triggerCommandMenuDropdown(event, recordName)
              }
            >
              {recordName}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const meta: Meta<typeof RecordIndexCommandMenuDropdown> = {
  title: 'Modules/CommandMenu/RecordIndexCommandMenuDropdown',
  component: RecordIndexCommandMenuDropdown,
  decorators: [
    (Story) => (
      <JotaiProvider store={jotaiStore}>
        <CommandMenuComponentInstanceContext.Provider
          value={{ instanceId: COMMAND_MENU_ID }}
        >
          <CommandMenuContext.Provider
            value={{
              displayType: 'dropdownItem',
              containerType: CommandMenuItemContainerType.IndexPageDropdown,
              commandMenuItems: COMMAND_MENU_ITEMS,
              commandMenuContextApi: EMPTY_COMMAND_MENU_CONTEXT_API,
              isInPreviewMode: false,
            }}
          >
            <StoryRecordTable />
            <Story />
          </CommandMenuContext.Provider>
        </CommandMenuComponentInstanceContext.Provider>
      </JotaiProvider>
    ),
    ContextStoreDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
    MemoryRouterDecorator,
  ],
  beforeEach: () => {
    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      installedApplications: [
        ...mockCurrentWorkspace.installedApplications,
        THIRD_PARTY_APPLICATION,
      ],
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

type Story = StoryObj<typeof RecordIndexCommandMenuDropdown>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await rightClickRecord({ canvasElement, recordName: 'Airbnb', offset: 8 });

    expect(
      await within(canvasElement.ownerDocument.body).findByRole('menu', {
        name: 'Actions',
      }),
    ).toBeVisible();
  },
};

export const OpensAtThePointerOfTheRightClickedRecord: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const firstPointer = await rightClickRecord({
      canvasElement,
      recordName: 'Airbnb',
      offset: 8,
    });
    const menu = await body.findByRole('menu', { name: 'Actions' });

    await waitFor(() =>
      expect(menu.getBoundingClientRect()).toMatchObject({
        left: firstPointer.clientX,
        top: firstPointer.clientY,
      }),
    );
    await waitFor(() =>
      expect(
        body.getByRole('menuitem', { name: 'Add to favorites' }),
      ).toHaveFocus(),
    );
    expect(isRecordRowSelected('Airbnb')).toBe(true);
    expect(jotaiStore.get(currentFocusIdSelector.atom)).toBe(
      COMMAND_MENU_DROPDOWN_ID,
    );
    expect(
      body.queryByRole('menuitem', { name: 'Go to People' }),
    ).not.toBeInTheDocument();
    expect(
      body.getByRole('menuitem', { name: /Sync with Acme/ }),
    ).toHaveTextContent(THIRD_PARTY_APPLICATION.name);

    const secondPointer = await rightClickRecord({
      canvasElement,
      recordName: 'Stripe',
      offset: 24,
    });

    await waitFor(() =>
      expect(menu.getBoundingClientRect()).toMatchObject({
        left: secondPointer.clientX,
        top: secondPointer.clientY,
      }),
    );
    expect(body.getAllByRole('menu')).toHaveLength(1);
    expect(isRecordRowSelected('Stripe')).toBe(true);

    await userEvent.keyboard('{Escape}');

    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    expect(isCommandMenuDropdownOpen()).toBe(false);
    expect(jotaiStore.get(currentFocusIdSelector.atom)).not.toBe(
      COMMAND_MENU_DROPDOWN_ID,
    );
  },
};

export const MoreActionsOpensTheSidePanelCommandMenu: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await rightClickRecord({ canvasElement, recordName: 'Airbnb', offset: 8 });
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'More actions' }),
    );

    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    expect(jotaiStore.get(isSidePanelOpenedState.atom)).toBe(true);
    expect(isCommandMenuDropdownOpen()).toBe(false);

    jotaiStore.set(isSidePanelOpenedState.atom, false);

    await rightClickRecord({ canvasElement, recordName: 'Stripe', offset: 8 });
    await waitFor(() =>
      expect(
        body.getByRole('menuitem', { name: 'Add to favorites' }),
      ).toHaveFocus(),
    );
    await userEvent.keyboard('{ArrowUp}');
    expect(body.getByRole('menuitem', { name: 'More actions' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');

    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    expect(jotaiStore.get(isSidePanelOpenedState.atom)).toBe(true);
  },
};

export const OrdinaryCommandClosesTheMenu: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await rightClickRecord({ canvasElement, recordName: 'Airbnb', offset: 8 });
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Add to favorites' }),
    );

    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    expect(
      jotaiStore
        .get(headlessCommandContextApisState.atom)
        .has('mock-add-to-favorites'),
    ).toBe(true);
    expect(isCommandMenuDropdownOpen()).toBe(false);
  },
};

export const AsyncExportStaysOpenWithProgress: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await rightClickRecord({ canvasElement, recordName: 'Airbnb', offset: 8 });
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Export' }),
    );

    const mountedCommands = jotaiStore.get(
      headlessCommandContextApisState.atom,
    );

    expect(mountedCommands.has(EXPORT_COMMAND_ID)).toBe(true);
    expect(body.getByRole('menu', { name: 'Actions' })).toBeVisible();

    jotaiStore.set(
      commandMenuItemProgressFamilyState.atomFamily(EXPORT_COMMAND_ID),
      37,
    );

    const exportAction = await body.findByRole('menuitem', {
      name: /Export 37%/,
    });

    expect(exportAction).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(exportAction);

    expect(jotaiStore.get(headlessCommandContextApisState.atom)).toBe(
      mountedCommands,
    );
    expect(body.getByRole('menu', { name: 'Actions' })).toBeVisible();
  },
};
