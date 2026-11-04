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
import { type NavigationDrawerAttention } from '@/navigation/types/NavigationDrawerAttention';
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
  needsInputThreadCount: number;
  hasUnreadMentionThread: boolean;
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
  needsInputThreadCount,
  hasUnreadMentionThread,
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
          openThreadCount: unreadOpenThreadCount + needsInputThreadCount + 3,
          unreadOpenThreadCount,
          needsInputThreadCount,
          mentionThreadCount: hasUnreadMentionThread ? 1 : 0,
          assignedToMeThreadCount: 0,
          assignedThreadCount: 0,
          unassignedThreadCount: 3,
          hasUnreadOpenThread: unreadOpenThreadCount > 0,
          hasUnreadMentionThread,
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

const expectInboxButton = async (
  canvasElement: HTMLElement,
  {
    name,
    attention,
  }: { name: string; attention: NavigationDrawerAttention | null },
) => {
  const inboxButton = await within(canvasElement).findByRole('button', {
    name,
  });

  await expect(
    inboxButton
      .querySelector('[data-attention]')
      ?.getAttribute('data-attention') ?? null,
  ).toBe(attention);

  return inboxButton;
};

const meta: Meta<ModeSwitcherStoryProps> = {
  title: 'Modules/Navigation/MainNavigationDrawerModeSwitcher',
  component: MainNavigationDrawerModeSwitcher,
  decorators: [ComponentDecorator, ToastDecorator],
  parameters: { container: { width: 240, height: 180 } },
  args: {
    needsInputThreadCount: 1,
    hasUnreadMentionThread: false,
    unreadOpenThreadCount: 0,
    isExpanded: true,
    isInboxEnabled: true,
    routePath: '/',
  },
  render: (args) => (
    <ModeSwitcherStory
      key={JSON.stringify(args)}
      needsInputThreadCount={args.needsInputThreadCount}
      hasUnreadMentionThread={args.hasUnreadMentionThread}
      unreadOpenThreadCount={args.unreadOpenThreadCount}
      isExpanded={args.isExpanded}
      isInboxEnabled={args.isInboxEnabled}
      routePath={args.routePath}
    />
  ),
};

export default meta;
type Story = StoryObj<ModeSwitcherStoryProps>;

export const NeedsInput: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expectInboxButton(canvasElement, {
      name: 'Inbox, needs your attention',
      attention: 'needs-input',
    });
    await userEvent.click(
      canvas.getByRole('button', { name: 'Collapse sidebar' }),
    );
    await expectInboxButton(canvasElement, {
      name: 'Inbox, needs your attention',
      attention: 'needs-input',
    });
  },
};

export const UnreadMention: Story = {
  args: { needsInputThreadCount: 0, hasUnreadMentionThread: true },
  play: async ({ canvasElement }) => {
    await expectInboxButton(canvasElement, {
      name: 'Inbox, needs your attention',
      attention: 'unread',
    });
  },
};

export const UnreadChatsThatDoNotNeedYou: Story = {
  args: { needsInputThreadCount: 0, unreadOpenThreadCount: 3 },
  play: async ({ canvasElement }) => {
    await expectInboxButton(canvasElement, { name: 'Inbox', attention: null });
  },
};

export const Collapsed: Story = {
  args: { isExpanded: false },
  play: async ({ canvasElement }) => {
    await expectInboxButton(canvasElement, {
      name: 'Inbox, needs your attention',
      attention: 'needs-input',
    });
  },
};

export const InboxActive: Story = {
  args: { routePath: '/inbox' },
  play: async ({ canvasElement }) => {
    await expectInboxButton(canvasElement, { name: 'Inbox', attention: null });
  },
};

export const InboxDisabled: Story = {
  args: { isInboxEnabled: false },
  play: async ({ canvasElement }) => {
    await expectInboxButton(canvasElement, { name: 'AI', attention: null });
  },
};
