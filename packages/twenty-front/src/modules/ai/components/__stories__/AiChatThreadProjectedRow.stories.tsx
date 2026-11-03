import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { type AgentChatThreadRowMetadata } from 'twenty-shared/ai';
import { Text } from 'twenty-ui/primitives/typography';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AiChatThreadAvatar } from '@/ai/components/AiChatThreadAvatar';
import { AiChatThreadRow } from '@/ai/components/AiChatThreadRow';
import { AiChatThreadRowTriage } from '@/ai/components/AiChatThreadRowTriage';
import { AiChatThreadSubtitle } from '@/ai/components/AiChatThreadSubtitle';
import { agentChatChannelViewState } from '@/ai/states/agentChatChannelViewState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatThreadRowMetadataFamilyState } from '@/ai/states/agentChatThreadRowMetadataFamilyState';
import { setAgentChatThreadPermissions } from '@/ai/testing/setAgentChatThreadPermissions';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadFilter,
  AgentChatChannelThreadStatus,
  AgentChatInboxAction,
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { MemoryRouterAppNavigatorProvider } from '~/testing/components/MemoryRouterAppNavigatorProvider';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { graphqlMocks } from '~/testing/graphqlMocks';
import {
  mockCurrentWorkspace,
  mockedUserData,
  mockedWorkspaceMemberData,
} from '~/testing/mock-data/users';

const THREAD_ID = '20202020-0000-4000-8000-000000000091';
const CHANNEL_ID = '20202020-0000-4000-8000-000000000092';
const ACTIVITY_AT = '2026-11-03T10:00:00.000Z';
const THREAD: AgentChatThreadRecord = {
  id: THREAD_ID,
  __typename: 'AgentChatThread',
  title: 'Weekly pipeline digest',
  createdAt: ACTIVITY_AT,
  updatedAt: ACTIVITY_AT,
  lastActivityAt: ACTIVITY_AT,
  lastMessageText: 'An older cached preview',
  lastMessageSenderWorkspaceMemberId: mockedWorkspaceMemberData.id,
  pendingQuestionMessageId: null,
  deletedAt: null,
  channelId: CHANNEL_ID,
  channelArchivedAt: null,
  channelSnoozedUntil: null,
};
const METADATA: AgentChatThreadRowMetadata = {
  threadId: THREAD_ID,
  activityAt: ACTIVITY_AT,
  pendingQuestionMessageId: null,
  messageId: '20202020-0000-4000-8000-000000000093',
  previewText: 'Three deals moved to Proposal',
  senderType: 'workflow',
  senderId: '20202020-0000-4000-8000-000000000094',
  senderName: 'Pipeline agent',
  executionOutcome: null,
};
const onPersonalDone = fn();
const onChannelDone = fn();

type RowScenario = {
  isInChannel?: boolean;
  isReadOnly?: boolean;
  metadata?: Partial<AgentChatThreadRowMetadata>;
};

const seedRow = (scenario: RowScenario) => {
  jotaiStore.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    featureFlags: [
      { key: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED, value: true },
    ],
  });
  jotaiStore.set(currentWorkspaceMemberState.atom, mockedWorkspaceMemberData);
  jotaiStore.set(currentUserWorkspaceState.atom, {
    ...mockedUserData.currentUserWorkspace,
    permissionFlags: [PermissionFlagType.AI],
  });
  setAgentChatThreadPermissions(jotaiStore, THREAD_ID, {
    canRead: true,
    canUpdate: !scenario.isReadOnly,
    canDelete: false,
    canSoftDelete: false,
  });
  jotaiStore.set(recordStoreFamilyState.atomFamily(THREAD_ID), THREAD);
  jotaiStore.set(agentChatThreadRowMetadataFamilyState.atomFamily(THREAD_ID), {
    ...METADATA,
    ...scenario.metadata,
  });
  jotaiStore.set(agentChatThreadParticipantsState.atom, {
    [THREAD_ID]: {
      __typename: 'AgentChatThreadParticipant',
      id: '20202020-0000-4000-8000-000000000095',
      threadId: THREAD_ID,
      archivedAt: null,
      snoozedUntil: null,
      isSubscribed: true,
      lastReadAt: ACTIVITY_AT,
      lastMentionedAt: null,
      mentionsResolvedAt: null,
      updatedAt: ACTIVITY_AT,
    },
  });
  jotaiStore.set(
    agentChatChannelViewState.atom,
    scenario.isInChannel
      ? {
          channelId: CHANNEL_ID,
          channelStatus: AgentChatChannelThreadStatus.OPEN,
          assignment: AgentChatChannelAssignmentFilter.ANY,
          filter: AgentChatChannelThreadFilter.ANY,
        }
      : null,
  );
};

const meta = {
  title: 'Modules/AI/AiChatThreadProjectedRow',
  component: AiChatThreadRow,
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/inbox']}>
        <MemoryRouterAppNavigatorProvider>
          <Story />
        </MemoryRouterAppNavigatorProvider>
      </MemoryRouter>
    ),
    ToastDecorator,
    RootDecorator,
    ComponentDecorator,
  ],
  args: {
    id: THREAD_ID,
    label: THREAD.title ?? '',
    avatar: <AiChatThreadAvatar thread={THREAD} size="lg" />,
    title: <Text size="md">Weekly pipeline digest</Text>,
    subtitle: <AiChatThreadSubtitle thread={THREAD} />,
    actions: <AiChatThreadRowTriage threadId={THREAD_ID} />,
    onClick: fn(),
  },
  beforeEach: ({ parameters }) => {
    const unsubscribe = jotaiStore.sub(
      currentUserWorkspaceState.atom,
      () => undefined,
    );
    seedRow(parameters.rowScenario ?? {});
    onPersonalDone.mockClear();
    onChannelDone.mockClear();
    return unsubscribe;
  },
  parameters: {
    container: { width: 760 },
    msw: {
      handlers: [
        graphql.mutation('UpdateAgentChatThreadInboxState', ({ variables }) => {
          onPersonalDone(variables);
          return HttpResponse.json({
            data: {
              updateAgentChatThreadInboxState: [
                jotaiStore.get(agentChatThreadParticipantsState.atom)?.[
                  THREAD_ID
                ],
              ],
            },
          });
        }),
        graphql.mutation(
          'MarkAgentChatThreadAsDoneInChannel',
          ({ variables }) => {
            onChannelDone(variables);
            return HttpResponse.json({
              data: { markAgentChatThreadAsDoneInChannel: true },
            });
          },
        ),
        ...graphqlMocks.handlers,
      ],
    },
  },
} satisfies Meta<typeof AiChatThreadRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WorkflowSender: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('Pipeline agent: Three deals moved to Proposal'),
    ).toBeVisible();
    await expect(
      canvas.queryByText('An older cached preview'),
    ).not.toBeInTheDocument();
    await expect(canvas.queryByText('Finished')).not.toBeInTheDocument();
  },
};

export const PersistedExecutionOutcomes: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const { outcome, label } of [
      { outcome: 'finished', label: 'Finished' },
      { outcome: 'failed', label: 'Failed' },
      { outcome: 'cancelled', label: 'Cancelled' },
      { outcome: 'needsInput', label: 'Needs input' },
    ] as const) {
      jotaiStore.set(
        agentChatThreadRowMetadataFamilyState.atomFamily(THREAD_ID),
        {
          ...METADATA,
          senderType: 'assistant',
          senderId: null,
          senderName: null,
          executionOutcome: outcome,
        },
      );
      await expect(await canvas.findByText(label)).toBeVisible();
    }
    await expect(
      canvas.getByText('Ada: Three deals moved to Proposal'),
    ).toBeVisible();
  },
};

export const ReadOnlyChannel: Story = {
  parameters: { rowScenario: { isInChannel: true, isReadOnly: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(
      canvas.getByRole('group', { name: 'Weekly pipeline digest' }),
    );
    await expect(
      canvas.queryByRole('button', { name: 'Done' }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('button', { name: 'Snooze' }),
    ).not.toBeInTheDocument();
  },
};

export const PersonalActionWithReadAccess: Story = {
  parameters: { rowScenario: { isReadOnly: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(
      canvas.getByRole('group', { name: 'Weekly pipeline digest' }),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(onPersonalDone).toHaveBeenCalledTimes(1));
    await expect(onPersonalDone).toHaveBeenCalledWith({
      threadIds: [THREAD_ID],
      action: AgentChatInboxAction.ARCHIVE,
    });
    await expect(onChannelDone).not.toHaveBeenCalled();
  },
};

export const SharedChannelAction: Story = {
  parameters: { rowScenario: { isInChannel: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(
      canvas.getByRole('group', { name: 'Weekly pipeline digest' }),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(onChannelDone).toHaveBeenCalledTimes(1));
    await expect(onChannelDone).toHaveBeenCalledWith({ threadId: THREAD_ID });
    await expect(onPersonalDone).not.toHaveBeenCalled();
  },
};

export const ApplicationSender: Story = {
  parameters: {
    rowScenario: {
      metadata: { senderType: 'application', senderName: 'Renewals' },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('Renewals: Three deals moved to Proposal'),
    ).toBeVisible();
    await expect(canvas.queryByText('Finished')).not.toBeInTheDocument();
  },
};
