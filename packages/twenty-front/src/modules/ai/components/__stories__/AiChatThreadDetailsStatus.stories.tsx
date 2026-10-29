import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { MemoryRouter } from 'react-router-dom';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { SidePanelPages } from 'twenty-shared/types';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { ComponentDecorator } from 'twenty-ui/testing';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatThreadDetailsStatus } from '@/ai/components/AiChatThreadDetailsStatus';
import { agentChatChannelViewState } from '@/ai/states/agentChatChannelViewState';
import { agentChatChannelsState } from '@/ai/states/agentChatChannelsState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { setAgentChatThreadPermissions } from '@/ai/testing/setAgentChatThreadPermissions';
import { type AgentChatChannel } from '@/ai/types/AgentChatChannel';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { isSnoozeAiChatForChannelComponentState } from '@/side-panel/pages/snooze-ai-chat/states/isSnoozeAiChatForChannelComponentState';
import { snoozeAiChatThreadIdsComponentState } from '@/side-panel/pages/snooze-ai-chat/states/snoozeAiChatThreadIdsComponentState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadStatus,
  AgentChatInboxAction,
  type AgentChatThreadParticipantFieldsFragment,
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

const THREAD_ID = '20202020-0000-4000-8000-000000000001';
const CHANNEL_ID = '20202020-0000-4000-8000-000000000002';
const FILED_AT = '2020-01-02T00:00:00.000Z';
const ACTIVITY_AT = '2020-01-01T00:00:00.000Z';
const PERSONAL_STATUS_LABEL = 'Change status in Your inbox';
const CHANNEL_STATUS_LABEL = 'Change status in Sales';

const CHANNEL: AgentChatChannel = {
  id: CHANNEL_ID,
  name: 'Sales',
  icon: 'IconHash',
  color: 'green',
  isAccessible: true,
  applicationId: 'workspace-custom-application-id',
  position: 1,
  roleIds: [],
};

const PARTICIPANT: AgentChatThreadParticipantFieldsFragment = {
  __typename: 'AgentChatThreadParticipant',
  id: '20202020-0000-4000-8000-000000000003',
  threadId: THREAD_ID,
  lastReadAt: ACTIVITY_AT,
  archivedAt: null,
  snoozedUntil: null,
  isSubscribed: true,
  lastMentionedAt: null,
  updatedAt: ACTIVITY_AT,
};

const onPersonalAction = fn();
const onChannelDone = fn();
const onChannelReopen = fn();

const StyledDetails = styled.dl`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  margin: 0;
  padding: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

type StatusScenario = {
  hasChannel?: boolean;
  isChannelView?: boolean;
  isReadOnly?: boolean;
  areParticipantsLoading?: boolean;
  isNotInPersonalInbox?: boolean;
  areChannelsLoading?: boolean;
  isChannelInaccessible?: boolean;
  isDeleted?: boolean;
  isMissing?: boolean;
  hasReadAccess?: boolean;
  isInboxEnabled?: boolean;
  hasAiPermission?: boolean;
};

const changeStatus = async ({
  canvasElement,
  label,
  status,
}: {
  canvasElement: HTMLElement;
  label: string;
  status: 'Open' | 'Snoozed' | 'Done';
}) => {
  const canvas = within(canvasElement);
  const body = within(canvasElement.ownerDocument.body);
  const trigger = await canvas.findByRole('button', { name: label });

  await waitFor(() => expect(trigger).toBeEnabled());
  await userEvent.click(trigger);
  await userEvent.click(
    await body.findByRole('menuitemradio', { name: status }),
  );
};

const expectStatusHidden = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  await expect(
    within(canvasElement).queryByText('Status'),
  ).not.toBeInTheDocument();
};

const checkSnoozeScope = async ({
  canvasElement,
  isInChannel,
}: {
  canvasElement: HTMLElement;
  isInChannel: boolean;
}) => {
  await changeStatus({
    canvasElement,
    label: isInChannel ? CHANNEL_STATUS_LABEL : PERSONAL_STATUS_LABEL,
    status: 'Snoozed',
  });

  const snoozePage = jotaiStore
    .get(sidePanelNavigationStackState.atom)
    .find(({ page }) => page === SidePanelPages.SnoozeAiChat);

  assertIsDefinedOrThrow(snoozePage);
  await expect(
    jotaiStore.get(
      snoozeAiChatThreadIdsComponentState.atomFamily({
        instanceId: snoozePage.pageId,
      }),
    ),
  ).toEqual([THREAD_ID]);

  await expect(
    jotaiStore.get(
      isSnoozeAiChatForChannelComponentState.atomFamily({
        instanceId: snoozePage.pageId,
      }),
    ),
  ).toBe(isInChannel);
  await expect(onPersonalAction).not.toHaveBeenCalled();
  await expect(onChannelDone).not.toHaveBeenCalled();
};

const DEFAULT_SCENARIO: StatusScenario = {};

const getScenarioParticipants = (
  scenario: Pick<
    StatusScenario,
    'areParticipantsLoading' | 'isNotInPersonalInbox'
  >,
): Record<string, AgentChatThreadParticipantFieldsFragment> | null => {
  if (scenario.areParticipantsLoading) {
    return null;
  }

  if (scenario.isNotInPersonalInbox) {
    return {};
  }

  return { [THREAD_ID]: PARTICIPANT };
};

const seedStatusScenario = (scenario: StatusScenario) => {
  jotaiStore.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    featureFlags: [
      {
        key: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
        value: scenario.isInboxEnabled ?? true,
      },
    ],
  });
  jotaiStore.set(currentWorkspaceMemberState.atom, mockedWorkspaceMemberData);
  jotaiStore.set(currentUserWorkspaceState.atom, {
    ...mockedUserData.currentUserWorkspace,
    permissionFlags:
      (scenario.hasAiPermission ?? true) ? [PermissionFlagType.AI] : [],
  });
  setAgentChatThreadPermissions(jotaiStore, THREAD_ID, {
    canRead: scenario.hasReadAccess ?? true,
    canUpdate: !scenario.isReadOnly,
    canDelete: false,
    canSoftDelete: false,
  });
  jotaiStore.set(
    recordStoreFamilyState.atomFamily(THREAD_ID),
    scenario.isMissing
      ? null
      : {
          __typename: 'AgentChatThread',
          id: THREAD_ID,
          title: 'Pricing questions',
          createdAt: ACTIVITY_AT,
          updatedAt: ACTIVITY_AT,
          lastActivityAt: ACTIVITY_AT,
          deletedAt: scenario.isDeleted ? FILED_AT : null,
          channelId: (scenario.hasChannel ?? true) ? CHANNEL_ID : null,
          channelArchivedAt: FILED_AT,
          channelSnoozedUntil: null,
        },
  );
  jotaiStore.set(
    agentChatChannelsState.atom,
    scenario.areChannelsLoading
      ? null
      : [{ ...CHANNEL, isAccessible: !scenario.isChannelInaccessible }],
  );
  jotaiStore.set(
    agentChatThreadParticipantsState.atom,
    getScenarioParticipants(scenario),
  );
  jotaiStore.set(
    agentChatChannelViewState.atom,
    scenario.isChannelView
      ? {
          channelId: CHANNEL_ID,
          channelStatus: AgentChatChannelThreadStatus.OPEN,
          assignment: AgentChatChannelAssignmentFilter.ANY,
        }
      : null,
  );
};

const meta = {
  title: 'Modules/AI/AiChatThreadDetailsStatus',
  component: AiChatThreadDetailsStatus,
  decorators: [
    (Story, { parameters }) => (
      <MemoryRouter initialEntries={[parameters.path ?? '/inbox']}>
        <MemoryRouterAppNavigatorProvider>
          <StyledDetails>
            <Story />
          </StyledDetails>
        </MemoryRouterAppNavigatorProvider>
      </MemoryRouter>
    ),
    ToastDecorator,
    RootDecorator,
    ComponentDecorator,
  ],
  args: { threadId: THREAD_ID, dropdownId: 'details-status-story' },
  beforeEach: ({ parameters }) => {
    const unsubscribeFromCurrentUserWorkspace = jotaiStore.sub(
      currentUserWorkspaceState.atom,
      () => undefined,
    );

    seedStatusScenario(parameters.statusScenario ?? DEFAULT_SCENARIO);
    onPersonalAction.mockClear();
    onChannelDone.mockClear();
    onChannelReopen.mockClear();

    return unsubscribeFromCurrentUserWorkspace;
  },
  parameters: {
    container: { width: 400, height: 240 },
    msw: {
      handlers: [
        graphql.mutation('UpdateAgentChatThreadInboxState', ({ variables }) => {
          onPersonalAction(variables);

          return HttpResponse.json({
            data: {
              updateAgentChatThreadInboxState: [
                jotaiStore.get(agentChatThreadParticipantsState.atom)?.[
                  THREAD_ID
                ] ?? PARTICIPANT,
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
        graphql.mutation('ReopenAgentChatThreadInChannel', ({ variables }) => {
          onChannelReopen(variables);

          return HttpResponse.json({
            data: { reopenAgentChatThreadInChannel: true },
          });
        }),
        ...graphqlMocks.handlers,
      ],
    },
  },
} satisfies Meta<typeof AiChatThreadDetailsStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PersonalInbox: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Open')).toBeVisible();
    await changeStatus({
      canvasElement,
      label: PERSONAL_STATUS_LABEL,
      status: 'Open',
    });
    await changeStatus({
      canvasElement,
      label: PERSONAL_STATUS_LABEL,
      status: 'Done',
    });
    await waitFor(() => expect(onPersonalAction).toHaveBeenCalledTimes(1));
    await expect(onPersonalAction).toHaveBeenLastCalledWith({
      threadIds: [THREAD_ID],
      action: AgentChatInboxAction.ARCHIVE,
    });
    await expect(canvas.getByText('Done')).toBeVisible();
    await changeStatus({
      canvasElement,
      label: PERSONAL_STATUS_LABEL,
      status: 'Open',
    });
    await waitFor(() => expect(onPersonalAction).toHaveBeenCalledTimes(2));
    await expect(onPersonalAction).toHaveBeenLastCalledWith({
      threadIds: [THREAD_ID],
      action: AgentChatInboxAction.MOVE_TO_INBOX,
    });
    await expect(canvas.getByText('Open')).toBeVisible();
    await expect(
      jotaiStore.get(recordStoreFamilyState.atomFamily(THREAD_ID))
        ?.channelArchivedAt,
    ).toBe(FILED_AT);
    await expect(onChannelDone).not.toHaveBeenCalled();
    await expect(onChannelReopen).not.toHaveBeenCalled();
  },
};

export const ChannelInbox: Story = {
  parameters: { statusScenario: { isChannelView: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Done')).toBeVisible();
    await changeStatus({
      canvasElement,
      label: CHANNEL_STATUS_LABEL,
      status: 'Done',
    });
    await changeStatus({
      canvasElement,
      label: CHANNEL_STATUS_LABEL,
      status: 'Open',
    });
    await waitFor(() => expect(onChannelReopen).toHaveBeenCalledTimes(1));
    await expect(onChannelReopen).toHaveBeenCalledWith({ threadId: THREAD_ID });
    await expect(onChannelDone).not.toHaveBeenCalled();
    await expect(canvas.getByText('Open')).toBeVisible();
    await changeStatus({
      canvasElement,
      label: CHANNEL_STATUS_LABEL,
      status: 'Done',
    });
    await waitFor(() => expect(onChannelDone).toHaveBeenCalledTimes(1));
    await expect(onChannelDone).toHaveBeenCalledWith({ threadId: THREAD_ID });
    await expect(canvas.getByText('Done')).toBeVisible();
    await expect(onPersonalAction).not.toHaveBeenCalled();
  },
};

export const StandaloneChannel: Story = {
  ...ChannelInbox,
  parameters: { path: '/chat', statusScenario: { isChannelView: false } },
};

export const StandalonePersonal: Story = {
  ...PersonalInbox,
  parameters: { path: '/chat', statusScenario: { hasChannel: false } },
};

export const ReadOnlyChannel: Story = {
  parameters: {
    statusScenario: { isChannelView: true, isReadOnly: true },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Done')).toBeVisible();
    await expect(canvas.getByText('Sales')).toBeVisible();
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

export const ReadOnlyPersonal: Story = {
  ...PersonalInbox,
  parameters: { statusScenario: { isReadOnly: true } },
};

export const ChannelWhileParticipantsLoad: Story = {
  parameters: {
    path: '/chat',
    statusScenario: { areParticipantsLoading: true },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Done')).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: CHANNEL_STATUS_LABEL }),
    ).toBeEnabled();
  },
};

export const InaccessibleChannel: Story = {
  parameters: {
    path: '/chat',
    statusScenario: { isChannelInaccessible: true },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('button', { name: PERSONAL_STATUS_LABEL }),
    ).toBeEnabled();
    await expect(canvas.getByText('Open')).toBeVisible();
    await expect(canvas.queryByText('Sales')).not.toBeInTheDocument();
  },
};

export const PersonalSnooze: Story = {
  play: async ({ canvasElement }) =>
    checkSnoozeScope({ canvasElement, isInChannel: false }),
};

export const ChannelSnooze: Story = {
  parameters: { statusScenario: { isChannelView: true } },
  play: async ({ canvasElement }) =>
    checkSnoozeScope({ canvasElement, isInChannel: true }),
};

export const ChannelsLoading: Story = {
  parameters: { path: '/chat', statusScenario: { areChannelsLoading: true } },
  play: expectStatusHidden,
};

export const ParticipantsLoading: Story = {
  parameters: { statusScenario: { areParticipantsLoading: true } },
  play: expectStatusHidden,
};

export const OutsidePersonalInbox: Story = {
  parameters: { statusScenario: { isNotInPersonalInbox: true } },
  play: expectStatusHidden,
};

export const Deleted: Story = {
  parameters: { statusScenario: { isDeleted: true } },
  play: expectStatusHidden,
};

export const Missing: Story = {
  parameters: { statusScenario: { isMissing: true } },
  play: expectStatusHidden,
};

export const AccessRevoked: Story = {
  parameters: { statusScenario: { hasReadAccess: false } },
  play: expectStatusHidden,
};

export const InboxDisabled: Story = {
  parameters: { statusScenario: { isInboxEnabled: false } },
  play: expectStatusHidden,
};

export const WithoutAiPermission: Story = {
  parameters: { statusScenario: { hasAiPermission: false } },
  play: expectStatusHidden,
};
