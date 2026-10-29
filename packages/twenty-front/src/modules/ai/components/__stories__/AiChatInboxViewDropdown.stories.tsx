import { MockedProvider } from '@apollo/client/testing/react';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatInboxViewDropdown } from '@/ai/components/AiChatInboxViewDropdown';
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
import { MemoryRouterAppNavigatorProvider } from '~/testing/components/MemoryRouterAppNavigatorProvider';
import {
  mockCurrentWorkspace,
  mockedUserData,
} from '~/testing/mock-data/users';

const RECORD_SELECTION_INSTANCE_ID = 'inbox-view-story';
const SELECTED_THREAD_ID = '6f1c2b0e-7a4d-4e8b-9c3f-2d5a1b8e7c60';
const OPEN_OPTION_PATTERN = /^Open\b/;
const NEEDS_INPUT_OPTION_PATTERN = /^Needs input\b/;

const StyledHeader = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  display: flex;
  padding: ${themeCssVariables.spacing[3]};
  width: 360px;
`;

const InboxViewStory = () => {
  const { pathname } = useLocation();
  const selectedRecordIds = useAtomComponentSelectorValue(
    selectedRecordIdsComponentSelector,
  );

  return (
    <StyledHeader
      role="region"
      aria-label="Inbox header"
      data-pathname={pathname}
    >
      <AiChatInboxViewDropdown selectedThreadCount={selectedRecordIds.length} />
    </StyledHeader>
  );
};

const meta = {
  title: 'Modules/AI/AiChatInboxViewDropdown',
  component: AiChatInboxViewDropdown,
  decorators: [
    (Story, { parameters }) => (
      <MockedProvider
        mocks={[
          {
            request: { query: GetAgentChatOpenThreadsSummaryDocument },
            delay: 0,
            result: {
              data: {
                agentChatOpenThreadsSummary: {
                  __typename: 'AgentChatOpenThreadsSummary',
                  openThreadCount: parameters.emptyCounts === true ? 0 : 8,
                  unreadOpenThreadCount: 0,
                  needsInputThreadCount:
                    parameters.emptyCounts === true ? 0 : 4,
                  hasUnreadOpenThread: false,
                  hasUnreadMentionThread: false,
                  hasUnreadAssignedThread: false,
                },
              },
            },
          },
        ]}
      >
        <MemoryRouter initialEntries={[`/inbox/${SELECTED_THREAD_ID}`]}>
          <MemoryRouterAppNavigatorProvider>
            <RecordSelectionComponentInstanceContext.Provider
              value={{ instanceId: RECORD_SELECTION_INSTANCE_ID }}
            >
              <Story />
            </RecordSelectionComponentInstanceContext.Provider>
          </MemoryRouterAppNavigatorProvider>
        </MemoryRouter>
      </MockedProvider>
    ),
    ComponentDecorator,
  ],
  render: InboxViewStory,
  parameters: { container: { width: 440, height: 280 } },
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
} satisfies Meta<typeof AiChatInboxViewDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SwitchViews: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', {
      name: 'Filter inbox chats: Open',
    });

    await expect(canvas.getByText('1 selected')).toBeVisible();
    await userEvent.click(trigger);

    const openOption = await body.findByRole('menuitemradio', {
      name: OPEN_OPTION_PATTERN,
    });
    const needsInputOption = body.getByRole('menuitemradio', {
      name: NEEDS_INPUT_OPTION_PATTERN,
    });

    await expect(openOption).toHaveAttribute('aria-checked', 'true');
    await expect(await within(openOption).findByText('8')).toBeVisible();
    await expect(await within(needsInputOption).findByText('4')).toBeVisible();
    await userEvent.click(needsInputOption);
    await expect(trigger).toHaveAccessibleName(
      'Filter inbox chats: Needs input',
    );
    await expect(canvas.queryByText('1 selected')).not.toBeInTheDocument();
    await expect(
      canvas.getByRole('region', { name: 'Inbox header' }),
    ).toHaveAttribute('data-pathname', '/inbox');

    await userEvent.click(trigger);
    await expect(
      await body.findByRole('menuitemradio', {
        name: NEEDS_INPUT_OPTION_PATTERN,
      }),
    ).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(
      body.getByRole('menuitemradio', { name: 'Assigned' }),
    );
    await expect(trigger).toHaveAccessibleName('Filter inbox chats: Assigned');

    await userEvent.click(trigger);
    await expect(
      await body.findByRole('menuitemradio', { name: 'Assigned' }),
    ).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(
      body.getByRole('menuitemradio', { name: 'Mentions' }),
    );
    await expect(trigger).toHaveAccessibleName('Filter inbox chats: Mentions');

    await userEvent.click(trigger);
    await userEvent.click(
      await body.findByRole('menuitemradio', { name: OPEN_OPTION_PATTERN }),
    );
    await expect(trigger).toHaveAccessibleName('Filter inbox chats: Open');
  },
};

export const KeyboardSelection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', {
      name: 'Filter inbox chats: Open',
    });

    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    const openOption = await body.findByRole('menuitemradio', {
      name: OPEN_OPTION_PATTERN,
    });

    await waitFor(() => expect(openOption).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());

    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() =>
      expect(
        body.getByRole('menuitemradio', { name: OPEN_OPTION_PATTERN }),
      ).toHaveFocus(),
    );
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(trigger).toHaveAccessibleName(
      'Filter inbox chats: Needs input',
    );
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await expect(canvas.queryByText('1 selected')).not.toBeInTheDocument();
  },
};

export const EmptyCounts: Story = {
  parameters: { emptyCounts: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Filter inbox chats: Open' }),
    );
    await expect(
      await body.findByRole('menuitemradio', { name: 'Open' }),
    ).toBeVisible();
    await expect(
      body.getByRole('menuitemradio', { name: 'Needs input' }),
    ).toBeVisible();
    await expect(body.queryByText('0')).not.toBeInTheDocument();
  },
};
