import { MockedProvider } from '@apollo/client/testing/react';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type ComponentProps } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { expect, userEvent, within } from 'storybook/test';
import { themeCssVariables } from 'twenty-ui/theme';

import { NavigationDrawerAiChatInboxSection } from '@/ai/components/NavigationDrawerAiChatInboxSection';
import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { AI_CHAT_INBOX_NAVIGATION_SECTION_ID } from '@/ai/constants/AiChatInboxNavigationSectionId';
import { agentChatChannelViewState } from '@/ai/states/agentChatChannelViewState';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { NAVIGATION_DRAWER_CONSTRAINTS } from '@/ui/navigation/navigation-drawer/constants/NavigationDrawerConstraints';
import { isNavigationSectionOpenFamilyState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionOpenFamilyState';
import { isNavigationSectionShowingAllItemsFamilyState } from '@/ui/navigation/navigation-drawer/states/isNavigationSectionShowingAllItemsFamilyState';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  AgentChatChannelAssignmentFilter,
  AgentChatChannelThreadStatus,
  FeatureFlagKey,
  GetAgentChatOpenThreadsSummaryDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { MemoryRouterAppNavigatorProvider } from '~/testing/components/MemoryRouterAppNavigatorProvider';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import {
  mockCurrentWorkspace,
  mockedUserData,
} from '~/testing/mock-data/users';

type StoryProps = NonNullable<
  ComponentProps<typeof NavigationDrawerAiChatInboxSection>
>;

const StyledNavigation = styled.div`
  background: ${themeCssVariables.background.secondary};
  box-sizing: border-box;
  padding: ${themeCssVariables.spacing[2]};
  width: ${NAVIGATION_DRAWER_CONSTRAINTS.default}px;
`;

const INBOX_FILTER_LABELS = [
  'Open',
  'Needs input',
  'Mentions',
  'Assigned',
  'Snoozed',
  'Done',
];

const meta = {
  title: 'Modules/AI/NavigationDrawerAiChatInboxSection',
  component: NavigationDrawerAiChatInboxSection,
  decorators: [
    IconsProviderDecorator,
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
                  openThreadCount: 2,
                  needsInputThreadCount: 0,
                  hasUnreadOpenThread: false,
                  hasUnreadMentionThread: false,
                  hasUnreadAssignedThread: false,
                  unreadMentionThreadCount: 0,
                  unreadAssignedThreadCount: 0,
                },
              },
            },
          },
        ]}
      >
        <MemoryRouter initialEntries={['/objects/companies']}>
          <MemoryRouterAppNavigatorProvider>
            <StyledNavigation>
              <Story />
            </StyledNavigation>
          </MemoryRouterAppNavigatorProvider>
        </MemoryRouter>
      </MockedProvider>
    ),
  ],
  args: { visibleItemLimit: 1 },
  beforeEach: () => {
    jotaiStore.set(isNavigationDrawerExpandedState.atom, true);
    jotaiStore.set(
      isNavigationSectionOpenFamilyState.atomFamily(
        AI_CHAT_INBOX_NAVIGATION_SECTION_ID,
      ),
      true,
    );
    jotaiStore.set(
      isNavigationSectionShowingAllItemsFamilyState.atomFamily(
        AI_CHAT_INBOX_NAVIGATION_SECTION_ID,
      ),
      false,
    );
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
    jotaiStore.set(
      agentChatThreadFilterStatusState.atom,
      AGENT_CHAT_THREAD_FILTER_STATUS.SNOOZED,
    );
    jotaiStore.set(agentChatChannelViewState.atom, {
      channelId: 'sales',
      channelStatus: AgentChatChannelThreadStatus.OPEN,
      assignment: AgentChatChannelAssignmentFilter.ANY,
    });

    return () => {
      jotaiStore.set(agentChatChannelViewState.atom, null);
      jotaiStore.set(
        isNavigationSectionShowingAllItemsFamilyState.atomFamily(
          AI_CHAT_INBOX_NAVIGATION_SECTION_ID,
        ),
        false,
      );
    };
  },
} satisfies Meta<StoryProps>;

export default meta;
type Story = StoryObj<StoryProps>;

export const FlatFilters: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('button', { name: 'Open' })).toBeVisible();
    await expect(canvas.getAllByRole('button')).toHaveLength(2);
    await userEvent.click(canvas.getByRole('button', { name: 'See more' }));

    for (const label of INBOX_FILTER_LABELS) {
      await expect(canvas.getByRole('button', { name: label })).toBeVisible();
    }

    await userEvent.click(canvas.getByRole('button', { name: 'Snoozed' }));
    await expect(
      canvas.getByRole('button', { name: 'Snoozed' }),
    ).toHaveAttribute('aria-current', 'true');
    await expect(jotaiStore.get(agentChatChannelViewState.atom)).toBeNull();

    await userEvent.click(canvas.getByRole('button', { name: 'Done' }));
    await expect(canvas.getByRole('button', { name: 'Done' })).toHaveAttribute(
      'aria-current',
      'true',
    );

    for (const label of INBOX_FILTER_LABELS) {
      await expect(canvas.getByRole('button', { name: label })).toBeVisible();
    }

    await userEvent.click(canvas.getByRole('button', { name: 'Mentions' }));
    await expect(
      canvas.getByRole('button', { name: 'Mentions' }),
    ).toHaveAttribute('aria-current', 'true');
    await userEvent.click(canvas.getByRole('button', { name: 'See less' }));
    await expect(canvas.getAllByRole('button')).toHaveLength(2);
    await userEvent.click(canvas.getByRole('button', { name: 'See more' }));
    await expect(
      canvas.getByRole('button', { name: 'Mentions' }),
    ).toHaveAttribute('aria-current', 'true');
  },
};
