import { MockedProvider } from '@apollo/client/testing/react';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatInboxPersonalViewDropdown } from '@/ai/components/AiChatInboxPersonalViewDropdown';
import { AiChatInboxViewHeading } from '@/ai/components/AiChatInboxViewHeading';
import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { agentChatChannelViewState } from '@/ai/states/agentChatChannelViewState';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordSelectionComponentInstanceContext } from '@/object-record/record-selection/states/contexts/RecordSelectionComponentInstanceContext';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import { selectedRecordIdsComponentSelector } from '@/object-record/record-selection/states/selectors/selectedRecordIdsComponentSelector';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  FeatureFlagKey,
  GetAgentChatOpenThreadsSummaryDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import {
  mockCurrentWorkspace,
  mockedUserData,
} from '~/testing/mock-data/users';

const RECORD_SELECTION_INSTANCE_ID = 'personal-view-story';
const SELECTED_THREAD_ID = 'selected-chat';
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
  width: 100%;
`;

const PersonalViewStory = () => {
  const selectedRecordIds = useAtomComponentSelectorValue(
    selectedRecordIdsComponentSelector,
  );

  return (
    <StyledHeader>
      <AiChatInboxViewHeading selectedThreadCount={selectedRecordIds.length} />
      <AiChatInboxPersonalViewDropdown />
    </StyledHeader>
  );
};

const meta = {
  title: 'Modules/AI/AiChatInboxPersonalViewDropdown',
  component: AiChatInboxPersonalViewDropdown,
  decorators: [
    (Story) => (
      <MockedProvider
        mocks={[
          {
            request: { query: GetAgentChatOpenThreadsSummaryDocument },
            delay: 0,
            result: {
              data: {
                agentChatOpenThreadsSummary: {
                  __typename: 'AgentChatOpenThreadsSummary',
                  openThreadCount: 8,
                  unreadOpenThreadCount: 1,
                  needsInputThreadCount: 4,
                  mentionThreadCount: 2,
                  assignedToMeThreadCount: 1,
                  assignedThreadCount: 3,
                  unassignedThreadCount: 5,
                  hasUnreadOpenThread: true,
                  hasUnreadMentionThread: true,
                  hasUnreadAssignedThread: false,
                },
              },
            },
          },
        ]}
      >
        <RecordSelectionComponentInstanceContext.Provider
          value={{ instanceId: RECORD_SELECTION_INSTANCE_ID }}
        >
          <Story />
        </RecordSelectionComponentInstanceContext.Provider>
      </MockedProvider>
    ),
    ComponentDecorator,
    MemoryRouterDecorator,
  ],
  render: PersonalViewStory,
  parameters: { container: { width: 560, height: 280 } },
  beforeEach: () => {
    jotaiStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      featureFlags: [
        { key: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED, value: true },
      ],
    });
    jotaiStore.set(currentUserWorkspaceState.atom, {
      ...mockedUserData.currentUserWorkspace,
      permissionFlags: [PermissionFlagType.AI],
    });
    jotaiStore.set(agentChatChannelViewState.atom, null);
    jotaiStore.set(
      agentChatThreadFilterStatusState.atom,
      AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE,
    );
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
  },
} satisfies Meta<typeof AiChatInboxPersonalViewDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SwitchViews: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Filter chats' });

    await expect(canvas.getByText('Open')).toBeVisible();
    await expect(canvas.getByText('1 selected')).toBeVisible();
    await userEvent.click(trigger);

    const openOption = await body.findByRole('menuitemradio', {
      name: OPEN_OPTION_PATTERN,
    });

    await expect(openOption).toHaveAttribute('aria-checked', 'true');
    await expect(await within(openOption).findByText('8')).toBeVisible();
    await expect(
      await within(
        body.getByRole('menuitemradio', { name: NEEDS_INPUT_OPTION_PATTERN }),
      ).findByText('4'),
    ).toBeVisible();
    await expect(
      await within(
        body.getByRole('menuitemradio', { name: MENTIONS_OPTION_PATTERN }),
      ).findByText('2'),
    ).toBeVisible();
    await expect(
      await within(
        body.getByRole('menuitemradio', {
          name: ASSIGNED_TO_ME_OPTION_PATTERN,
        }),
      ).findByText('1'),
    ).toBeVisible();
    await expect(
      await within(
        body.getByRole('menuitemradio', { name: ASSIGNED_OPTION_PATTERN }),
      ).findByText('3'),
    ).toBeVisible();
    await expect(
      await within(
        body.getByRole('menuitemradio', { name: UNASSIGNED_OPTION_PATTERN }),
      ).findByText('5'),
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
    await expect(jotaiStore.get(agentChatThreadFilterStatusState.atom)).toBe(
      AGENT_CHAT_THREAD_FILTER_STATUS.NEEDS_INPUT,
    );

    await userEvent.click(trigger);
    await userEvent.click(
      await body.findByRole('menuitemradio', {
        name: ASSIGNED_TO_ME_OPTION_PATTERN,
      }),
    );
    await expect(canvas.getByText('Assigned to me')).toBeVisible();

    await userEvent.click(trigger);
    await userEvent.click(
      await body.findByRole('menuitemradio', {
        name: UNASSIGNED_OPTION_PATTERN,
      }),
    );
    await expect(canvas.getByText('Unassigned')).toBeVisible();

    await userEvent.click(trigger);
    await userEvent.click(
      await body.findByRole('menuitemradio', { name: OPEN_OPTION_PATTERN }),
    );
    await expect(canvas.getByText('Open')).toBeVisible();
  },
};

export const FromSnoozed: Story = {
  beforeEach: () => {
    jotaiStore.set(
      agentChatThreadFilterStatusState.atom,
      AGENT_CHAT_THREAD_FILTER_STATUS.SNOOZED,
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await expect(canvas.getByText('Snoozed')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Filter chats' }));
    await userEvent.click(
      await body.findByRole('menuitemradio', {
        name: MENTIONS_OPTION_PATTERN,
      }),
    );
    await expect(canvas.getByText('Mentions')).toBeVisible();
    await expect(jotaiStore.get(agentChatThreadFilterStatusState.atom)).toBe(
      AGENT_CHAT_THREAD_FILTER_STATUS.MENTIONS,
    );
  },
};
