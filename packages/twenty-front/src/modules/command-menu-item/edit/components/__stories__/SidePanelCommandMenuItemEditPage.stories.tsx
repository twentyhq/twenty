import { COMMAND_MENU_DROPDOWN_CLICK_OUTSIDE_ID } from '@/command-menu-item/constants/CommandMenuDropdownClickOutsideId';
import { SidePanelCommandMenuItemEditPage } from '@/command-menu-item/edit/components/SidePanelCommandMenuItemEditPage';
import { commandMenuItemsDraftState } from '@/command-menu-item/edit/states/commandMenuItemsDraftState';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentPageTypeComponentState } from '@/context-store/states/contextStoreCurrentPageTypeComponentState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { useRef } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ContextStorePageType } from 'twenty-shared/types';
import { ComponentDecorator } from 'twenty-ui/testing';
import {
  CommandMenuItemAvailabilityType,
  EngineComponentKey,
  type CommandMenuItemFieldsFragment,
} from '~/generated-metadata/graphql';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';

const leaveRecordIndexSelection = fn();

const PINNED_COMMAND_MENU_ITEM: CommandMenuItemFieldsFragment = {
  __typename: 'CommandMenuItem',
  isActive: true,
  id: '5f1c1d8e-0c4a-4a51-9b8e-6f3f5b8f1a01',
  workflowVersionId: null,
  frontComponentId: null,
  frontComponent: null,
  engineComponentKey: EngineComponentKey.GO_TO_PEOPLE,
  label: 'Go to People',
  icon: 'IconUser',
  shortLabel: 'People',
  position: 0,
  isPinned: true,
  hotKeys: null,
  conditionalAvailabilityExpression: null,
  availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
  availabilityObjectMetadataId: null,
  payload: null,
};

const OTHER_COMMAND_MENU_ITEM: CommandMenuItemFieldsFragment = {
  ...PINNED_COMMAND_MENU_ITEM,
  id: '5f1c1d8e-0c4a-4a51-9b8e-6f3f5b8f1a02',
  engineComponentKey: EngineComponentKey.GO_TO_COMPANIES,
  label: 'Go to Companies',
  icon: 'IconBuildingSkyscraper',
  shortLabel: 'Companies',
  position: 1,
  isPinned: false,
};

const SERVER_COMMAND_MENU_ITEMS = {
  current: [PINNED_COMMAND_MENU_ITEM, OTHER_COMMAND_MENU_ITEM],
  draft: [],
  status: 'up-to-date' as const,
};

const RecordIndexSelectionListener = () => {
  const recordIndexRef = useRef<HTMLDivElement>(null);

  useListenClickOutside({
    refs: [recordIndexRef],
    excludedClickOutsideIds: [COMMAND_MENU_DROPDOWN_CLICK_OUTSIDE_ID],
    listenerId: 'story-record-index-selection',
    callback: leaveRecordIndexSelection,
  });

  return <div ref={recordIndexRef}>Record index</div>;
};

const meta: Meta<typeof SidePanelCommandMenuItemEditPage> = {
  title: 'Modules/CommandMenu/SidePanelCommandMenuItemEditPage',
  component: SidePanelCommandMenuItemEditPage,
  decorators: [
    (Story) => {
      jotaiStore.set(
        metadataStoreState.atomFamily('commandMenuItems'),
        SERVER_COMMAND_MENU_ITEMS,
      );

      return (
        <>
          <RecordIndexSelectionListener />
          <Story />
        </>
      );
    },
    ComponentDecorator,
    ContextStoreDecorator,
    ObjectMetadataItemsDecorator,
    ToastDecorator,
    MemoryRouterDecorator,
  ],
  parameters: {
    msw: {
      handlers: [
        ...graphqlMocks.handlers,
        graphql.mutation('ResetCommandMenuItem', () =>
          HttpResponse.json({
            data: { resetCommandMenuItem: PINNED_COMMAND_MENU_ITEM },
          }),
        ),
      ],
    },
  },
  beforeEach: () => {
    leaveRecordIndexSelection.mockClear();
    jotaiStore.set(commandMenuItemsDraftState.atom, [
      PINNED_COMMAND_MENU_ITEM,
      OTHER_COMMAND_MENU_ITEM,
    ]);
  },
};

export default meta;
type Story = StoryObj<typeof SidePanelCommandMenuItemEditPage>;

export const Default: Story = {};

export const RecordSelectionPicker: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await canvas.findByRole(
      'button',
      { name: 'No record selected' },
      { timeout: 3000 },
    );

    await userEvent.click(trigger);

    const picker = await body.findByRole('dialog', {
      name: 'Record selection',
    });

    expect(
      within(picker).getByRole('button', { name: 'No record selected' }),
    ).toHaveAttribute('aria-pressed', 'true');

    await userEvent.click(
      within(picker).getByRole('button', { name: 'Records selected' }),
    );

    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(leaveRecordIndexSelection).not.toHaveBeenCalled();

    await userEvent.click(canvas.getByText('Pinned'));

    expect(leaveRecordIndexSelection).toHaveBeenCalledTimes(1);
  },
};

export const RecordSelectionDisabledOnRecordPages: Story = {
  beforeEach: () => {
    jotaiStore.set(
      contextStoreCurrentPageTypeComponentState.atomFamily({
        instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
      ContextStorePageType.Record,
    );
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await within(canvasElement).findByRole(
      'button',
      { name: 'No record selected' },
      { timeout: 3000 },
    );

    expect(trigger).toHaveAttribute('aria-disabled', 'true');

    await userEvent.click(trigger);

    expect(body.queryByRole('dialog')).not.toBeInTheDocument();
  },
};

export const CommandMenuItemOptions: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      await canvas.findByRole(
        'button',
        { name: 'More options' },
        { timeout: 3000 },
      ),
    );

    const options = await body.findByRole('dialog', { name: 'More options' });

    expect(
      jotaiStore
        .get(commandMenuItemsDraftState.atom)
        ?.find((item) => item.id === PINNED_COMMAND_MENU_ITEM.id)?.isPinned,
    ).toBe(true);

    const hideLabel = within(options).getByRole('switch', {
      name: 'Hide label',
    });

    expect(hideLabel).not.toBeChecked();

    await userEvent.click(hideLabel);

    await waitFor(() => expect(hideLabel).toBeChecked());
    expect(options).toBeVisible();
    expect(
      jotaiStore
        .get(commandMenuItemsDraftState.atom)
        ?.find((item) => item.id === PINNED_COMMAND_MENU_ITEM.id)?.shortLabel,
    ).toBeNull();

    await userEvent.click(
      within(options).getByRole('button', { name: 'Reset to default' }),
    );

    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(
        jotaiStore
          .get(commandMenuItemsDraftState.atom)
          ?.find((item) => item.id === PINNED_COMMAND_MENU_ITEM.id)?.shortLabel,
      ).toBe('People'),
    );
  },
};
