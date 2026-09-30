import { fieldsWidgetEditorModeDraftComponentState } from '@/page-layout/states/fieldsWidgetEditorModeDraftComponentState';
import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { FieldsConfigurationEditor } from '@/page-layout/widgets/fields/components/FieldsConfigurationEditor';
import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { SIDE_PANEL_CLICK_OUTSIDE_ID } from '@/side-panel/constants/SidePanelClickOutsideId';
import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type ReactNode, StrictMode, useRef } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const PAGE_LAYOUT_ID = 'story-page-layout';
const WIDGET_ID = 'story-fields-widget';

const closeSidePanel = fn();

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow(
  CoreObjectNameSingular.Company,
);

const GROUPS: FieldsWidgetGroup[] = [
  {
    id: 'general-group',
    name: 'General',
    position: 0,
    isVisible: true,
    fields: [
      {
        fieldMetadataItem: getMockFieldMetadataItemOrThrow({
          objectMetadataItem: companyObjectMetadataItem,
          fieldName: 'name',
        }),
        position: 0,
        isVisible: true,
        globalIndex: 0,
      },
    ],
  },
  {
    id: 'details-group',
    name: 'Details',
    position: 1,
    isVisible: true,
    fields: [],
  },
];

const getGroupNames = () =>
  [
    ...(jotaiStore.get(
      fieldsWidgetGroupsDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
      }),
    )[WIDGET_ID] ?? []),
  ]
    .sort(
      (firstGroup, secondGroup) => firstGroup.position - secondGroup.position,
    )
    .map((group) => group.name);

const openGroupMenu = async ({
  canvasElement,
  groupIndex,
}: {
  canvasElement: HTMLElement;
  groupIndex: number;
}) => {
  const groupMenuTriggers = await within(canvasElement).findAllByRole(
    'button',
    { name: 'More options' },
    { timeout: 3000 },
  );
  const groupMenuTrigger = groupMenuTriggers.at(groupIndex);

  if (groupMenuTrigger === undefined) {
    throw new Error(`Group ${groupIndex} has no menu`);
  }

  await userEvent.click(groupMenuTrigger);

  return within(canvasElement.ownerDocument.body).findByRole('menu', {
    name: 'More options',
  });
};

const SidePanel = ({ children }: { children: ReactNode }) => {
  const sidePanelRef = useRef<HTMLDivElement>(null);

  useListenClickOutside({
    refs: [sidePanelRef],
    excludedClickOutsideIds: [SIDE_PANEL_CLICK_OUTSIDE_ID],
    listenerId: 'story-side-panel',
    callback: closeSidePanel,
  });

  return (
    <WorkspaceSurfaceContext.Provider
      value={{
        type: 'side-panel',
        instanceId: 'story-side-panel',
        ownsRouteLocation: false,
      }}
    >
      <div
        ref={sidePanelRef}
        data-click-outside-id={SIDE_PANEL_CLICK_OUTSIDE_ID}
      >
        <ParentClickOutsideIdContext.Provider
          value={SIDE_PANEL_CLICK_OUTSIDE_ID}
        >
          {children}
        </ParentClickOutsideIdContext.Provider>
      </div>
    </WorkspaceSurfaceContext.Provider>
  );
};

const meta: Meta<typeof FieldsConfigurationEditor> = {
  title: 'Modules/PageLayout/Widgets/FieldsConfigurationEditor',
  component: FieldsConfigurationEditor,
  decorators: [
    (Story) => (
      <StrictMode>
        <SidePanel>
          <Story />
        </SidePanel>
      </StrictMode>
    ),
    ComponentDecorator,
    ContextStoreDecorator,
    ObjectMetadataItemsDecorator,
    MemoryRouterDecorator,
  ],
  args: {
    pageLayoutId: PAGE_LAYOUT_ID,
    widgetId: WIDGET_ID,
  },
  parameters: {
    container: { width: 360 },
  },
  beforeEach: () => {
    closeSidePanel.mockClear();
    jotaiStore.set(
      fieldsWidgetEditorModeDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
      }),
      { [WIDGET_ID]: 'grouped' },
    );
    jotaiStore.set(
      fieldsWidgetGroupsDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
      }),
      { [WIDGET_ID]: GROUPS },
    );
  },
};

export default meta;
type Story = StoryObj<typeof FieldsConfigurationEditor>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('General', {}, { timeout: 3000 }),
    ).toBeVisible();
    expect(canvas.getByText('Details')).toBeVisible();
    expect(
      canvas.getAllByRole('button', { name: 'More options' }),
    ).toHaveLength(2);
  },
};

export const GroupMenu: Story = {
  play: async ({ canvasElement }) => {
    const groupMenu = await openGroupMenu({ canvasElement, groupIndex: 0 });

    expect(
      within(groupMenu)
        .getAllByRole('menuitem')
        .map((menuItem) => menuItem.textContent),
    ).toEqual(['Rename', 'Delete', 'Add a Group']);

    await userEvent.click(
      within(groupMenu).getByRole('menuitem', { name: 'Delete' }),
    );

    await waitFor(() => expect(getGroupNames()).toEqual(['Details']));
    expect(
      within(canvasElement.ownerDocument.body).queryByRole('menu'),
    ).not.toBeInTheDocument();
  },
};

export const RenameFromTheGroupMenu: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const groupMenu = await openGroupMenu({ canvasElement, groupIndex: 0 });

    await userEvent.click(
      within(groupMenu).getByRole('menuitem', { name: 'Rename' }),
    );

    const renamePanel = await body.findByRole('dialog', {
      name: 'Rename group',
    });
    const groupNameInput = within(renamePanel).getByRole('textbox', {
      name: 'Group name',
    });

    await waitFor(() => expect(groupNameInput).toHaveFocus());
    expect(groupNameInput).toHaveValue('General');
    expect(body.queryByRole('menu')).not.toBeInTheDocument();

    const groupHeader = canvas.getByText('General');
    const groupHeaderRow = groupHeader.closest('[data-dnd-sortable-handle]');

    if (groupHeaderRow === null) {
      throw new Error('Group header is not a drag handle');
    }

    const groupHeaderRect = groupHeaderRow.getBoundingClientRect();

    await waitFor(() => {
      const renamePanelRect = renamePanel.getBoundingClientRect();

      expect(renamePanelRect.left).toBeCloseTo(groupHeaderRect.left + 32, 0);
      expect(renamePanelRect.top).toBeCloseTo(groupHeaderRect.bottom, 0);
    });
    await waitFor(() => expect(renamePanel).toBeVisible());

    await userEvent.click(groupHeader);

    expect(body.getByRole('dialog', { name: 'Rename group' })).toBeVisible();

    await userEvent.click(groupNameInput);
    await userEvent.clear(groupNameInput);
    await userEvent.type(groupNameInput, '  Company profile  {Enter}');

    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(getGroupNames()).toEqual(['Company profile', 'Details']);
    expect(closeSidePanel).not.toHaveBeenCalled();
  },
};

export const RenameWithDoneEmptyNameAndEscape: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    const openRenamePanel = async () => {
      const groupMenu = await openGroupMenu({ canvasElement, groupIndex: 1 });

      await userEvent.click(
        within(groupMenu).getByRole('menuitem', { name: 'Rename' }),
      );

      const renamePanel = await body.findByRole('dialog', {
        name: 'Rename group',
      });
      const groupNameInput = within(renamePanel).getByRole('textbox', {
        name: 'Group name',
      });

      await waitFor(() => expect(groupNameInput).toHaveFocus());

      return { renamePanel, groupNameInput };
    };

    const doneRename = await openRenamePanel();

    await userEvent.clear(doneRename.groupNameInput);
    await userEvent.type(doneRename.groupNameInput, 'Contact');
    await userEvent.click(
      within(doneRename.renamePanel).getByRole('button', { name: 'Done' }),
    );

    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(getGroupNames()).toEqual(['General', 'Contact']);

    const emptyRename = await openRenamePanel();

    await userEvent.clear(emptyRename.groupNameInput);
    await userEvent.keyboard('{Enter}');

    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(getGroupNames()).toEqual(['General', 'Contact']);

    const escapedRename = await openRenamePanel();

    await userEvent.type(escapedRename.groupNameInput, ' details');
    await userEvent.keyboard('{Escape}');

    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(getGroupNames()).toEqual(['General', 'Contact']);
    expect(closeSidePanel).not.toHaveBeenCalled();
  },
};

export const AddAGroupOpensItsRenamePanel: Story = {
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const groupMenu = await openGroupMenu({ canvasElement, groupIndex: 0 });

    await userEvent.click(
      within(groupMenu).getByRole('menuitem', { name: 'Add a Group' }),
    );

    const renamePanel = await body.findByRole('dialog', {
      name: 'Rename group',
    });
    const groupNameInput = within(renamePanel).getByRole('textbox', {
      name: 'Group name',
    });

    await waitFor(() => expect(groupNameInput).toHaveFocus());
    expect(groupNameInput).toHaveValue('New Group');
    expect(getGroupNames()).toEqual(['General', 'New Group', 'Details']);

    await userEvent.clear(groupNameInput);
    await userEvent.type(groupNameInput, 'Social{Enter}');

    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(getGroupNames()).toEqual(['General', 'Social', 'Details']);
  },
};
