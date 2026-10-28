import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { ComponentDecorator } from 'twenty-ui/testing';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatInboxChannelViewDropdown } from '@/ai/components/AiChatInboxChannelViewDropdown';
import { AiChatInboxViewHeading } from '@/ai/components/AiChatInboxViewHeading';
import { agentChatChannelViewState } from '@/ai/states/agentChatChannelViewState';
import { agentChatChannelsState } from '@/ai/states/agentChatChannelsState';
import { type AgentChatChannelView } from '@/ai/types/AgentChatChannelView';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordSelectionComponentInstanceContext } from '@/object-record/record-selection/states/contexts/RecordSelectionComponentInstanceContext';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import { selectedRecordIdsComponentSelector } from '@/object-record/record-selection/states/selectors/selectedRecordIdsComponentSelector';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadStatus,
} from '~/generated-metadata/graphql';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

const RECORD_SELECTION_INSTANCE_ID = 'channel-view-story';
const SELECTED_THREAD_ID = 'selected-chat';
const OPEN_VIEW: AgentChatChannelView = {
  channelId: 'sales',
  channelStatus: AgentChatChannelThreadStatus.OPEN,
  assignment: AgentChatChannelAssignmentFilter.ANY,
};

const StyledHeader = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[3]};
  width: 480px;
`;

const ChannelViewStory = () => {
  const channelView = useAtomStateValue(agentChatChannelViewState);
  const selectedRecordIds = useAtomComponentSelectorValue(
    selectedRecordIdsComponentSelector,
  );

  assertIsDefinedOrThrow(channelView);

  return (
    <StyledHeader>
      <AiChatInboxViewHeading selectedThreadCount={selectedRecordIds.length} />
      <AiChatInboxChannelViewDropdown channelView={channelView} />
    </StyledHeader>
  );
};

const meta = {
  title: 'Modules/AI/AiChatInboxChannelViewDropdown',
  component: AiChatInboxChannelViewDropdown,
  decorators: [
    (Story) => (
      <RecordSelectionComponentInstanceContext.Provider
        value={{ instanceId: RECORD_SELECTION_INSTANCE_ID }}
      >
        <Story />
      </RecordSelectionComponentInstanceContext.Provider>
    ),
    ComponentDecorator,
    MemoryRouterDecorator,
  ],
  render: ChannelViewStory,
  args: { channelView: OPEN_VIEW },
  parameters: { container: { width: 560, height: 280 } },
  beforeEach: ({ args }) => {
    jotaiStore.set(agentChatChannelsState.atom, [
      {
        id: OPEN_VIEW.channelId,
        name: 'Sales',
        icon: 'IconBrandShopee',
        color: 'green',
        isAccessible: true,
        isCustom: true,
        position: 1,
        roleIds: [],
      },
    ]);
    jotaiStore.set(agentChatChannelViewState.atom, args.channelView);
    jotaiStore.set(
      recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
        instanceId: RECORD_SELECTION_INSTANCE_ID,
        familyKey: NO_RECORD_GROUP_FAMILY_KEY,
      }),
      [SELECTED_THREAD_ID],
    );
    jotaiStore.set(
      isRecordSelectedComponentFamilyState.atomFamily({
        instanceId: RECORD_SELECTION_INSTANCE_ID,
        familyKey: SELECTED_THREAD_ID,
      }),
      true,
    );

    return () => {
      jotaiStore.set(agentChatChannelViewState.atom, null);
    };
  },
} satisfies Meta<typeof AiChatInboxChannelViewDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', {
      name: 'Filter channel chats',
    });

    await expect(canvas.getByText('Sales')).toBeVisible();
    await expect(canvas.getByText('Open')).toBeVisible();
    await expect(canvas.getByText('1 selected')).toBeVisible();
    await userEvent.click(trigger);
    await expect(
      await body.findByRole('menuitemradio', { name: 'All' }),
    ).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(
      body.getByRole('menuitemradio', { name: 'Unassigned' }),
    );
    await expect(canvas.getByText('Open · Unassigned')).toBeVisible();
    await expect(canvas.queryByText('1 selected')).not.toBeInTheDocument();

    await userEvent.click(trigger);
    await expect(
      await body.findByRole('menuitemradio', { name: 'Unassigned' }),
    ).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(body.getByRole('menuitemradio', { name: 'Mine' }));
    await expect(canvas.getByText('Assigned')).toBeVisible();

    await userEvent.click(trigger);
    await userEvent.click(
      await body.findByRole('menuitemradio', { name: 'All' }),
    );
    await expect(canvas.getByText('Open')).toBeVisible();
    await expect(canvas.getByText('Sales')).toBeVisible();
  },
};

export const Snoozed: Story = {
  args: {
    channelView: {
      ...OPEN_VIEW,
      channelStatus: AgentChatChannelThreadStatus.SNOOZED,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await expect(canvas.getByText('Snoozed')).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Filter channel chats' }),
    );
    await userEvent.click(
      await body.findByRole('menuitemradio', { name: 'Unassigned' }),
    );
    await expect(canvas.getByText('Snoozed · Unassigned')).toBeVisible();
    await expect(canvas.getByText('Sales')).toBeVisible();
    await expect(canvas.queryByText('1 selected')).not.toBeInTheDocument();
  },
};

export const ChannelsLoading: Story = {
  beforeEach: () => {
    jotaiStore.set(agentChatChannelsState.atom, null);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Open')).toBeVisible();
    await expect(canvas.queryByText('→')).not.toBeInTheDocument();
  },
};

export const EveryView: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', {
      name: 'Filter channel chats',
    });

    await userEvent.click(trigger);
    await userEvent.click(
      await body.findByRole('menuitemradio', { name: 'Snoozed' }),
    );
    await expect(canvas.getByText('Snoozed')).toBeVisible();
    await expect(canvas.queryByText('1 selected')).not.toBeInTheDocument();

    await userEvent.click(trigger);
    await expect(
      await body.findByRole('menuitemradio', { name: 'Snoozed' }),
    ).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(body.getByRole('menuitemradio', { name: 'Mine' }));
    await expect(canvas.getByText('Snoozed · Mine')).toBeVisible();

    await userEvent.click(trigger);
    await userEvent.click(
      await body.findByRole('menuitemradio', { name: 'Done' }),
    );
    await expect(canvas.getByText('Done')).toBeVisible();

    await userEvent.click(trigger);
    await userEvent.click(
      await body.findByRole('menuitemradio', { name: 'Assigned' }),
    );
    await expect(canvas.getByText('Assigned')).toBeVisible();

    await userEvent.click(trigger);
    await expect(
      await body.findByRole('menuitemradio', { name: 'Assigned' }),
    ).toHaveAttribute('aria-checked', 'true');
    await expect(
      body.getByRole('menuitemradio', { name: 'Mine' }),
    ).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(body.getByRole('menuitemradio', { name: 'Open' }));
    await expect(canvas.getByText('Open')).toBeVisible();
    await expect(canvas.getByText('Sales')).toBeVisible();
  },
};
