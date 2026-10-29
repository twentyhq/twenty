import { MockedProvider } from '@apollo/client/testing/react';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { themeCssVariables } from 'twenty-ui/theme';

import { NavigationDrawerAiChatTriageSection } from '@/ai/components/NavigationDrawerAiChatTriageSection';
import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { AI_CHAT_INBOX_INSTANCE_ID } from '@/ai/constants/AiChatInboxInstanceId';
import { agentChatChannelViewState } from '@/ai/states/agentChatChannelViewState';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import { NAVIGATION_DRAWER_CONSTRAINTS } from '@/ui/navigation/navigation-drawer/constants/NavigationDrawerConstraints';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  FeatureFlagKey,
  GetAgentChatOpenThreadsSummaryDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { ComponentWithRouterDecorator } from '~/testing/decorators/ComponentWithRouterDecorator';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import {
  mockCurrentWorkspace,
  mockedUserData,
} from '~/testing/mock-data/users';

const SELECTED_THREAD_ID = 'selected-chat';
const OPEN_ITEM_PATTERN = /^Open\b/;

const StyledNavigation = styled.div`
  background: ${themeCssVariables.background.secondary};
  box-sizing: border-box;
  padding: ${themeCssVariables.spacing[2]};
  width: ${NAVIGATION_DRAWER_CONSTRAINTS.default}px;
`;

const isSelectedThreadSelected = () =>
  jotaiStore.get(
    isRecordSelectedComponentFamilyState.atomFamily({
      instanceId: AI_CHAT_INBOX_INSTANCE_ID,
      familyKey: SELECTED_THREAD_ID,
    }),
  );

const meta: Meta = {
  title: 'Modules/AI/NavigationDrawerAiChatTriageSection',
  component: NavigationDrawerAiChatTriageSection,
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
                  openThreadCount: 3,
                  unreadOpenThreadCount: 0,
                  needsInputThreadCount: 1,
                  hasUnreadOpenThread: false,
                  hasUnreadMentionThread: false,
                  hasUnreadAssignedThread: false,
                },
              },
            },
          },
        ]}
      >
        <StyledNavigation>
          <Story />
        </StyledNavigation>
      </MockedProvider>
    ),
    IconsProviderDecorator,
    ComponentWithRouterDecorator,
  ],
  args: { routePath: '/inbox' },
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
      AGENT_CHAT_THREAD_FILTER_STATUS.NEEDS_INPUT,
    );
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
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const OpenRestoresEveryOpenChat: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const openItem = canvas.getByRole('button', { name: OPEN_ITEM_PATTERN });

    await expect(openItem).toHaveAttribute('aria-current', 'true');
    await expect(isSelectedThreadSelected()).toBe(true);
    await userEvent.click(openItem);
    await expect(jotaiStore.get(agentChatThreadFilterStatusState.atom)).toBe(
      AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE,
    );
    await expect(isSelectedThreadSelected()).toBe(false);
    await expect(
      canvas.getByRole('button', { name: OPEN_ITEM_PATTERN }),
    ).toHaveAttribute('aria-current', 'true');
  },
};

export const SnoozedClearsSelection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Snoozed' }));
    await expect(jotaiStore.get(agentChatThreadFilterStatusState.atom)).toBe(
      AGENT_CHAT_THREAD_FILTER_STATUS.SNOOZED,
    );
    await expect(isSelectedThreadSelected()).toBe(false);
    await expect(
      canvas.getByRole('button', { name: 'Snoozed' }),
    ).toHaveAttribute('aria-current', 'true');
  },
};
