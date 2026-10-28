import { MockedProvider } from '@apollo/client/testing/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { createStore, Provider } from 'jotai';
import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { MainNavigationDrawerModeSwitcher } from '@/navigation/components/MainNavigationDrawerModeSwitcher';
import { isNavigationDrawerExpandedState } from '@/ui/navigation/states/isNavigationDrawerExpanded';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import {
  FeatureFlagKey,
  GetAgentChatOpenThreadsSummaryDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import {
  mockCurrentWorkspace,
  mockedUserData,
} from '~/testing/mock-data/users';

type ModeSwitcherStoryProps = {
  unreadOpenThreadCount: number;
  isExpanded: boolean;
  isInboxEnabled: boolean;
  routePath: string;
};

const ModeSwitcherWithCollapseControl = () => {
  const [isExpanded, setIsExpanded] = useAtomState(
    isNavigationDrawerExpandedState,
  );

  return (
    <>
      <MainNavigationDrawerModeSwitcher />
      <Button onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
      </Button>
    </>
  );
};

const ModeSwitcherStory = ({
  unreadOpenThreadCount,
  isExpanded,
  isInboxEnabled,
  routePath,
}: ModeSwitcherStoryProps) => {
  const [store] = useState(() => {
    const initialStore = createStore();

    initialStore.set(isNavigationDrawerExpandedState.atom, isExpanded);
    initialStore.set(currentWorkspaceState.atom, {
      ...mockCurrentWorkspace,
      featureFlags: [
        { key: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED, value: isInboxEnabled },
      ],
    });
    initialStore.set(currentUserWorkspaceState.atom, {
      ...mockedUserData.currentUserWorkspace,
      permissionFlags: [PermissionFlagType.AI],
    });

    return initialStore;
  });

  const summaryMock = {
    request: { query: GetAgentChatOpenThreadsSummaryDocument },
    result: {
      data: {
        agentChatOpenThreadsSummary: {
          __typename: 'AgentChatOpenThreadsSummary' as const,
          openThreadCount: unreadOpenThreadCount + 3,
          unreadOpenThreadCount,
          needsInputThreadCount: 0,
          hasUnreadOpenThread: unreadOpenThreadCount > 0,
          hasUnreadMentionThread: false,
          hasUnreadAssignedThread: false,
        },
      },
    },
  };

  return (
    <Provider store={store}>
      <MockedProvider mocks={[summaryMock]}>
        <MemoryRouter initialEntries={[routePath]}>
          <ModeSwitcherWithCollapseControl />
        </MemoryRouter>
      </MockedProvider>
    </Provider>
  );
};

const meta: Meta<ModeSwitcherStoryProps> = {
  title: 'Modules/Navigation/MainNavigationDrawerModeSwitcher',
  component: MainNavigationDrawerModeSwitcher,
  decorators: [ComponentDecorator, ToastDecorator],
  parameters: { container: { width: 240, height: 180 } },
  args: {
    unreadOpenThreadCount: 3,
    isExpanded: true,
    isInboxEnabled: true,
    routePath: '/',
  },
  render: (args) => (
    <ModeSwitcherStory
      key={`${args.unreadOpenThreadCount}-${args.isExpanded}-${args.isInboxEnabled}-${args.routePath}`}
      unreadOpenThreadCount={args.unreadOpenThreadCount}
      isExpanded={args.isExpanded}
      isInboxEnabled={args.isInboxEnabled}
      routePath={args.routePath}
    />
  ),
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const label = args.isInboxEnabled ? 'Inbox' : 'AI';
    const shouldShowUnreadCount =
      args.isInboxEnabled &&
      args.unreadOpenThreadCount > 0 &&
      args.routePath !== '/inbox';
    const inboxButton = await canvas.findByRole('button', {
      name: shouldShowUnreadCount
        ? `${label}, ${args.unreadOpenThreadCount} unread`
        : label,
    });

    if (shouldShowUnreadCount) {
      await expect(
        within(inboxButton).getByText(String(args.unreadOpenThreadCount)),
      ).toBeVisible();
      return;
    }

    await expect(
      within(inboxButton).queryByText(String(args.unreadOpenThreadCount)),
    ).not.toBeInTheDocument();
  },
};

export default meta;
type Story = StoryObj<ModeSwitcherStoryProps>;

export const UnreadCount: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const inboxButton = await canvas.findByRole('button', {
      name: 'Inbox, 3 unread',
    });

    await expect(within(inboxButton).getByText('3')).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Collapse sidebar' }),
    );
    await expect(within(inboxButton).getByText('3')).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Expand sidebar' }),
    );
    await expect(within(inboxButton).getByText('3')).toBeVisible();
  },
};

export const DoubleDigitCount: Story = {
  args: { unreadOpenThreadCount: 24 },
};

export const LargeCount: Story = {
  args: { unreadOpenThreadCount: 128 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const inboxButton = await canvas.findByRole('button', {
      name: 'Inbox, 128 unread',
    });

    await expect(within(inboxButton).getByText('99+')).toBeVisible();
  },
};

export const Collapsed: Story = {
  args: { isExpanded: false },
};

export const AllRead: Story = {
  args: { unreadOpenThreadCount: 0 },
};

export const InboxActive: Story = {
  args: { routePath: '/inbox' },
};

export const InboxDisabled: Story = {
  args: { isInboxEnabled: false },
};
