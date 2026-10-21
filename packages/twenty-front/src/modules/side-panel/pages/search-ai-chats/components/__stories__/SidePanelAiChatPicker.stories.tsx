import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

import { SidePanelAiChatPicker } from '@/side-panel/pages/search-ai-chats/components/SidePanelAiChatPicker';
import { MemoryRouterDecorator } from '~/testing/decorators/MemoryRouterDecorator';

const THREADS = [
  { id: 'renewal-review', title: 'Review upcoming renewals' },
  { id: 'pipeline-summary', title: 'Summarize the sales pipeline' },
];

const meta = {
  title: 'Modules/SidePanel/SearchAiChats/SidePanelAiChatPicker',
  component: SidePanelAiChatPicker,
  decorators: [MemoryRouterDecorator, ComponentDecorator],
  args: {
    threads: THREADS,
    isLoading: false,
    isFetchingMore: false,
    hasNextPage: false,
    hasError: false,
    openingThreadId: null,
    hasOpenError: false,
    onSelectThread: fn(),
    onLoadMore: fn(),
    onRetry: fn(),
  },
} satisfies Meta<typeof SidePanelAiChatPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SelectChat: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Review upcoming renewals' }),
    );

    expect(args.onSelectThread).toHaveBeenLastCalledWith('renewal-review');

    const pipelineChat = canvas.getByRole('button', {
      name: 'Summarize the sales pipeline',
    });

    pipelineChat.focus();
    await userEvent.keyboard('{Enter}');

    expect(args.onSelectThread).toHaveBeenLastCalledWith('pipeline-summary');
    expect(args.onSelectThread).toHaveBeenCalledTimes(2);
  },
};

export const Searching: Story = {
  args: { isLoading: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByRole('status')).toHaveTextContent('Searching chats...');
    expect(
      canvas.queryByText('No chats match your search'),
    ).not.toBeInTheDocument();
    expect(
      canvas.queryByRole('button', { name: 'Review upcoming renewals' }),
    ).not.toBeInTheDocument();
  },
};

export const NoMatches: Story = {
  args: { threads: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByText('No chats match your search')).toBeVisible();
    expect(canvas.queryByRole('button')).not.toBeInTheDocument();
  },
};

export const FailedSearch: Story = {
  args: { threads: [], hasError: true },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByRole('alert')).toHaveTextContent('Could not load chats');
    expect(
      canvas.queryByText('No chats match your search'),
    ).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));

    expect(args.onRetry).toHaveBeenCalledOnce();
  },
};

export const MoreChatsAvailable: Story = {
  args: { hasNextPage: true },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Load more chats' }),
    );

    expect(args.onLoadMore).toHaveBeenCalledOnce();
  },
};

export const LoadingMoreChats: Story = {
  args: { hasNextPage: true, isFetchingMore: true },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const loadMore = canvas.getByRole('button', {
      name: 'Loading more chats...',
    });

    expect(loadMore).toBeDisabled();
    expect(
      canvas.getByRole('button', { name: 'Review upcoming renewals' }),
    ).toBeVisible();

    await userEvent.click(loadMore);

    expect(args.onLoadMore).not.toHaveBeenCalled();
  },
};

export const OpeningChat: Story = {
  args: { openingThreadId: 'renewal-review' },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const otherChat = canvas.getByRole('button', {
      name: 'Summarize the sales pipeline',
    });

    expect(canvas.getByRole('status')).toHaveTextContent('Opening chat...');
    expect(otherChat).toHaveAttribute('aria-disabled', 'true');

    await userEvent.click(otherChat);
    otherChat.focus();
    await userEvent.keyboard('{Enter}');

    expect(args.onSelectThread).not.toHaveBeenCalled();
  },
};

export const FailedOpen: Story = {
  args: { hasOpenError: true },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByRole('alert')).toHaveTextContent(
      'This chat could not be opened. Try selecting it again.',
    );

    await userEvent.click(
      canvas.getByRole('button', { name: 'Review upcoming renewals' }),
    );

    expect(args.onSelectThread).toHaveBeenCalledOnce();
  },
};
