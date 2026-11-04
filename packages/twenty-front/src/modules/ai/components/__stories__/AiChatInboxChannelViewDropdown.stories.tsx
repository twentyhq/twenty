import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { expect, userEvent, within } from 'storybook/test';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { ComponentDecorator } from 'twenty-ui/testing';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatInboxChannelViewDropdown } from '@/ai/components/AiChatInboxChannelViewDropdown';
import { AiChatInboxViewHeading } from '@/ai/components/AiChatInboxViewHeading';
import { AI_CHAT_INBOX_INSTANCE_ID } from '@/ai/constants/AiChatInboxInstanceId';
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
import { MemoryRouterAppNavigatorProvider } from '~/testing/components/MemoryRouterAppNavigatorProvider';

const SELECTED_THREAD_ID = 'selected-chat';
const OPEN_CHAT_PATH = '/inbox/6f1c2b0e-7a4d-4e8b-9c3f-2d5a1b8e7c60';
const OPEN_VIEW: AgentChatChannelView = {
  channelId: 'sales',
  channelStatus: AgentChatChannelThreadStatus.OPEN,
  assignment: AgentChatChannelAssignmentFilter.ANY,
  filter: AgentChatChannelThreadFilter.ANY,
};
const OPEN_OPTION_PATTERN = /^Open\b/;
const NEEDS_INPUT_OPTION_PATTERN = /^Needs input\b/;
const MENTIONS_OPTION_PATTERN = /^Mentions\b/;
const ASSIGNED_TO_ME_OPTION_PATTERN = /^Assigned to me\b/;
const ASSIGNED_OPTION_PATTERN = /^Assigned(?! to me)\b/;
const UNASSIGNED_OPTION_PATTERN = /^Unassigned\b/;

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
  const { pathname } = useLocation();
  const channelView = useAtomStateValue(agentChatChannelViewState);
  const selectedRecordIds = useAtomComponentSelectorValue(
    selectedRecordIdsComponentSelector,
  );

  assertIsDefinedOrThrow(channelView);

  return (
    <StyledHeader
      role="region"
      aria-label="Inbox header"
      data-pathname={pathname}
    >
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
        value={{ instanceId: AI_CHAT_INBOX_INSTANCE_ID }}
      >
        <Story />
      </RecordSelectionComponentInstanceContext.Provider>
    ),
    ComponentDecorator,
    (Story) => (
      <MemoryRouter initialEntries={[OPEN_CHAT_PATH]}>
        <MemoryRouterAppNavigatorProvider>
          <Story />
        </MemoryRouterAppNavigatorProvider>
      </MemoryRouter>
    ),
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
        mentionedCount: 3,
        assignedToMeCount: 1,
        assignedCount: 5,
        unassignedCount: 4,
        hasUnreadOpen: false,
        snoozedCount: 0,
        doneCount: 0,
      },
    });
    jotaiStore.set(agentChatChannelViewState.atom, args.channelView);
    jotaiStore.set(
      recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
        instanceId: AI_CHAT_INBOX_INSTANCE_ID,
        familyKey: NO_RECORD_GROUP_FAMILY_KEY,
      }),
      [SELECTED_THREAD_ID],
    );
    jotaiStore.set(
      isRecordSelectedComponentFamilyState.atomFamily({
        instanceId: AI_CHAT_INBOX_INSTANCE_ID,
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
      within(
        body.getByRole('menuitemradio', { name: MENTIONS_OPTION_PATTERN }),
      ).getByText('3'),
    ).toBeVisible();
    await expect(
      within(
        body.getByRole('menuitemradio', {
          name: ASSIGNED_TO_ME_OPTION_PATTERN,
        }),
      ).getByText('1'),
    ).toBeVisible();
    await expect(
      within(
        body.getByRole('menuitemradio', { name: ASSIGNED_OPTION_PATTERN }),
      ).getByText('5'),
    ).toBeVisible();
    await expect(
      within(
        body.getByRole('menuitemradio', { name: UNASSIGNED_OPTION_PATTERN }),
      ).getByText('4'),
    ).toBeVisible();
    await expect(body.queryByText('View')).not.toBeInTheDocument();
    await expect(
      body.queryByRole('menuitemradio', { name: 'Snoozed' }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      body.getByRole('menuitemradio', { name: NEEDS_INPUT_OPTION_PATTERN }),
    );
    await expect(canvas.getByText('Needs input')).toBeVisible();
    await expect(canvas.queryByText('1 selected')).not.toBeInTheDocument();
    await expect(
      canvas.getByRole('region', { name: 'Inbox header' }),
    ).toHaveAttribute('data-pathname', '/inbox');
    await expect(jotaiStore.get(agentChatChannelViewState.atom)).toEqual({
      ...OPEN_VIEW,
      filter: AgentChatChannelThreadFilter.NEEDS_INPUT,
    });

    await userEvent.click(trigger);
    await userEvent.click(
      await body.findByRole('menuitemradio', { name: MENTIONS_OPTION_PATTERN }),
    );
    await expect(canvas.getByText('Mentions')).toBeVisible();

    await userEvent.click(trigger);
    await userEvent.click(
      await body.findByRole('menuitemradio', {
        name: ASSIGNED_TO_ME_OPTION_PATTERN,
      }),
    );
    await expect(canvas.getByText('Assigned to me')).toBeVisible();
    await expect(jotaiStore.get(agentChatChannelViewState.atom)).toEqual({
      ...OPEN_VIEW,
      assignment: AgentChatChannelAssignmentFilter.ASSIGNED_TO_ME,
    });

    await userEvent.click(trigger);
    await userEvent.click(
      await body.findByRole('menuitemradio', {
        name: ASSIGNED_OPTION_PATTERN,
      }),
    );
    await expect(canvas.getByText('Assigned')).toBeVisible();
    await expect(jotaiStore.get(agentChatChannelViewState.atom)).toEqual({
      ...OPEN_VIEW,
      assignment: AgentChatChannelAssignmentFilter.ASSIGNED,
    });

    await userEvent.click(trigger);
    await userEvent.click(
      await body.findByRole('menuitemradio', {
        name: UNASSIGNED_OPTION_PATTERN,
      }),
    );
    await expect(canvas.getByText('Unassigned')).toBeVisible();
    await expect(jotaiStore.get(agentChatChannelViewState.atom)).toEqual({
      ...OPEN_VIEW,
      assignment: AgentChatChannelAssignmentFilter.UNASSIGNED,
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
