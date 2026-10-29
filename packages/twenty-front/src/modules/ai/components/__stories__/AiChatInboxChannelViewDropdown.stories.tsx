import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { ComponentDecorator } from 'twenty-ui/testing';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatInboxChannelViewDropdown } from '@/ai/components/AiChatInboxChannelViewDropdown';
import { AiChatInboxViewHeading } from '@/ai/components/AiChatInboxViewHeading';
import { agentChatChannelSummariesState } from '@/ai/states/agentChatChannelSummariesState';
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
  AgentChatChannelThreadFilter,
  AgentChatChannelThreadStatus,
} from '~/generated-metadata/graphql';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

const RECORD_SELECTION_INSTANCE_ID = 'channel-view-story';
const SELECTED_THREAD_ID = 'selected-chat';
const OPEN_VIEW: AgentChatChannelView = {
  channelId: 'sales',
  channelStatus: AgentChatChannelThreadStatus.OPEN,
  assignment: AgentChatChannelAssignmentFilter.ANY,
  filter: AgentChatChannelThreadFilter.ANY,
};
const OPEN_OPTION_PATTERN = /^Open\b/;
const NEEDS_INPUT_OPTION_PATTERN = /^Needs input\b/;
const ASSIGNED_OPTION_PATTERN = /^Assigned\b/;

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
        applicationId: 'workspace-custom-application-id',
        position: 1,
        roleIds: [],
      },
    ]);
    jotaiStore.set(agentChatChannelSummariesState.atom, {
      [OPEN_VIEW.channelId]: {
        openCount: 6,
        needsInputCount: 2,
        assignedToMeCount: 1,
        hasUnreadOpen: false,
        hasUnreadAssignedToMe: true,
        snoozedCount: 0,
        doneCount: 0,
      },
    });
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
    const trigger = canvas.getByRole('button', { name: 'Filter chats' });

    await expect(canvas.getByText('Sales')).toBeVisible();
    await expect(canvas.getByText('Open')).toBeVisible();
    await expect(canvas.getByText('1 selected')).toBeVisible();
    await userEvent.click(trigger);

    const openOption = await body.findByRole('menuitemradio', {
      name: OPEN_OPTION_PATTERN,
    });

    await expect(openOption).toHaveAttribute('aria-checked', 'true');
    await expect(within(openOption).getByText('6')).toBeVisible();
    await expect(
      within(
        body.getByRole('menuitemradio', { name: NEEDS_INPUT_OPTION_PATTERN }),
      ).getByText('2'),
    ).toBeVisible();
    await expect(
      body.getByRole('menuitemradio', { name: /^Assigned\s*, unread\b/ }),
    ).toBeVisible();
    await expect(
      body.getByRole('menuitemradio', { name: 'Mentions' }),
    ).toBeVisible();
    await expect(
      body.queryByRole('menuitemradio', { name: 'Snoozed' }),
    ).not.toBeInTheDocument();
    await expect(
      body.queryByRole('menuitemradio', { name: 'Unassigned' }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      body.getByRole('menuitemradio', { name: NEEDS_INPUT_OPTION_PATTERN }),
    );
    await expect(canvas.getByText('Needs input')).toBeVisible();
    await expect(canvas.queryByText('1 selected')).not.toBeInTheDocument();
    await expect(jotaiStore.get(agentChatChannelViewState.atom)).toEqual({
      ...OPEN_VIEW,
      filter: AgentChatChannelThreadFilter.NEEDS_INPUT,
    });

    await userEvent.click(trigger);
    await userEvent.click(
      await body.findByRole('menuitemradio', { name: 'Mentions' }),
    );
    await expect(canvas.getByText('Mentions')).toBeVisible();

    await userEvent.click(trigger);
    await userEvent.click(
      await body.findByRole('menuitemradio', {
        name: ASSIGNED_OPTION_PATTERN,
      }),
    );
    await expect(canvas.getByText('Assigned')).toBeVisible();
    await expect(jotaiStore.get(agentChatChannelViewState.atom)).toEqual({
      ...OPEN_VIEW,
      assignment: AgentChatChannelAssignmentFilter.ASSIGNED_TO_ME,
    });

    await userEvent.click(trigger);
    await userEvent.click(
      await body.findByRole('menuitemradio', { name: OPEN_OPTION_PATTERN }),
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
    await userEvent.click(canvas.getByRole('button', { name: 'Filter chats' }));
    await expect(
      await body.findByRole('menuitemradio', { name: OPEN_OPTION_PATTERN }),
    ).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(
      body.getByRole('menuitemradio', { name: NEEDS_INPUT_OPTION_PATTERN }),
    );
    await expect(canvas.getByText('Needs input')).toBeVisible();
    await expect(jotaiStore.get(agentChatChannelViewState.atom)).toEqual({
      ...OPEN_VIEW,
      filter: AgentChatChannelThreadFilter.NEEDS_INPUT,
    });
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
