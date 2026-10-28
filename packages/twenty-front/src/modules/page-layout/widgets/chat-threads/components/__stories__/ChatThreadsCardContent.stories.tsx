import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { isArray } from '@sniptt/guards';
import { type ReactNode } from 'react';
import mockDatePreview from 'storybook-addon-mock-date/preview';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { themeCssVariables } from 'twenty-ui/theme';

import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { ChatThreadsCardContent } from '@/page-layout/widgets/chat-threads/components/ChatThreadsCardContent';
import { type PartialWorkspaceMember } from '@/settings/roles/types/RoleWithPartialMembers';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { MOCKED_DATE } from '~/testing/constants/MockedDate';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { mockedWorkspaceMemberData } from '~/testing/mock-data/users';
import { getMockedDateWithOffset } from '~/testing/utils/getMockedDateWithOffset';

const WORKSPACE_MEMBERS = [
  {
    ...mockedWorkspaceMemberData,
    id: '20202020-0000-4000-8000-000000000001',
    name: { firstName: 'Sarah', lastName: 'Lin' },
    avatarUrl: null,
  },
  {
    ...mockedWorkspaceMemberData,
    id: '20202020-0000-4000-8000-000000000002',
    name: { firstName: 'Alex', lastName: 'Morgan' },
    avatarUrl: null,
  },
] satisfies PartialWorkspaceMember[];

const createThread = ({
  id,
  title,
  lastActivityAt,
  lastMessageText,
  workspaceMemberId = WORKSPACE_MEMBERS[0].id,
}: {
  id: string;
  title: string;
  lastActivityAt: string;
  lastMessageText: string;
  workspaceMemberId?: string;
}): AgentChatThreadRecord => ({
  __typename: 'AgentChatThread',
  id,
  title,
  deletedAt: null,
  createdAt: lastActivityAt,
  updatedAt: lastActivityAt,
  lastActivityAt,
  lastMessageText,
  workspaceMemberId,
  lastMessageSenderWorkspaceMemberId: workspaceMemberId,
});

const THREADS = [
  createThread({
    id: '20202020-0000-4000-8000-000000000011',
    title: 'Renewal outreach',
    lastActivityAt: MOCKED_DATE,
    lastMessageText:
      'I shared the renewal details and next steps with the team.',
  }),
  createThread({
    id: '20202020-0000-4000-8000-000000000012',
    title: 'Onboarding follow-up',
    lastActivityAt: getMockedDateWithOffset({ days: -1 }),
    lastMessageText: 'The onboarding checklist is ready for your review.',
    workspaceMemberId: WORKSPACE_MEMBERS[1].id,
  }),
  createThread({
    id: '20202020-0000-4000-8000-000000000013',
    title:
      'Contract renewal and onboarding details for the upcoming annual agreement',
    lastActivityAt: getMockedDateWithOffset({ days: -8 }),
    lastMessageText: 'The signed agreement is attached to the company record.',
  }),
];

const StyledWidget = styled.div`
  box-sizing: border-box;
  height: 360px;
  min-width: 0;
  padding: ${themeCssVariables.spacing[4]};
  width: 400px;
`;

const meta = {
  title: 'Modules/PageLayout/Widgets/ChatThreadsCardContent',
  component: ChatThreadsCardContent,
  decorators: [
    (Story, context) => {
      if ('clock' in Date) {
        return <Story />;
      }

      const mockDateDecorator = isArray(mockDatePreview.decorators)
        ? mockDatePreview.decorators[0]
        : mockDatePreview.decorators;

      return <>{mockDateDecorator?.(Story, context) as ReactNode}</>;
    },
    MemoryRouterDecorator,
    ToastDecorator,
  ],
  args: {
    loading: false,
    threads: THREADS,
    onRetry: fn(),
    onDetachThread: fn(),
    onLoadMore: fn(),
  },
  beforeEach: () => {
    jotaiStore.set(currentWorkspaceMembersState.atom, WORKSPACE_MEMBERS);
  },
  render: (args) => (
    <StyledWidget>
      <ChatThreadsCardContent
        loading={args.loading}
        error={args.error}
        threads={args.threads}
        onRetry={args.onRetry}
        onDetachThread={args.onDetachThread}
        hasNextPage={args.hasNextPage}
        isFetchingMoreThreads={args.isFetchingMoreThreads}
        onLoadMore={args.onLoadMore}
      />
    </StyledWidget>
  ),
} satisfies Meta<typeof ChatThreadsCardContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const title of ['Today', 'This week', 'Earlier']) {
      await expect(canvas.getByRole('heading', { name: title })).toBeVisible();
    }

    for (const thread of THREADS) {
      const row = canvas.getByRole('group', { name: thread.title ?? '' });

      await expect(row.getBoundingClientRect().height).toBe(32);
      await expect(row.getBoundingClientRect().width).toBe(368);
      await expect(row.scrollWidth).toBeLessThanOrEqual(row.clientWidth);
    }

    await expect(
      canvas.getByText(
        'Sarah Lin: I shared the renewal details and next steps with the team.',
      ),
    ).toBeVisible();
  },
};

export const Empty: Story = {
  args: { threads: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() =>
      expect(canvas.getByText('No conversations')).toBeVisible(),
    );
    await expect(
      canvas.queryByRole('button', { name: 'Load more conversations' }),
    ).not.toBeInTheDocument();
  },
};

export const Loading: Story = {
  args: { threads: [], loading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const loadingIndicator = canvasElement.querySelector('[aria-busy="true"]');

    await expect(loadingIndicator).toBeVisible();
    await expect(
      canvas.queryByText('No conversations'),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByText("We couldn't load the conversations"),
    ).not.toBeInTheDocument();
  },
};

export const Error: Story = {
  args: {
    threads: [],
    error: new globalThis.Error('Conversations are unavailable'),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText("We couldn't load the conversations"),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Try again' }));
    await expect(args.onRetry).toHaveBeenCalledTimes(1);
  },
};

export const LoadMore: Story = {
  args: { hasNextPage: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Load more conversations' }),
    );
    await expect(args.onLoadMore).toHaveBeenCalledTimes(1);
  },
};

export const EmptyFirstPage: Story = {
  args: { threads: [], hasNextPage: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.queryByText('No conversations'),
    ).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Load more conversations' }),
    );
    await expect(args.onLoadMore).toHaveBeenCalledTimes(1);
  },
};

export const LoadingMore: Story = {
  args: { hasNextPage: true, isFetchingMoreThreads: true },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Loading…',
    });

    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(args.onLoadMore).not.toHaveBeenCalled();
  },
};
