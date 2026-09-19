import { MockedProvider } from '@apollo/client/testing/react';
import { render, waitFor } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { AiChatUnreadThreadsTracker } from '@/ai/components/AiChatUnreadThreadsTracker';
import { agentChatUnreadThreadIdsState } from '@/ai/states/agentChatUnreadThreadIdsState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { GetUnreadChatThreadIdsDocument } from '~/generated-metadata/graphql';

const THREAD_ID = 'thread-1';

let threads: { id: string; lastMessageAt: string; updatedAt: string }[] = [];

jest.mock('@/ai/hooks/useChatThreads', () => ({
  useChatThreads: () => ({
    threads,
    hasNextPage: false,
    loading: false,
    fetchMoreRef: undefined,
  }),
}));

jest.mock('@/settings/roles/hooks/useHasPermissionFlag', () => ({
  useHasPermissionFlag: () => true,
}));

const buildUnreadMock = (
  result: jest.Mock<{ data: { unreadChatThreadIds: string[] } }>,
) => ({
  request: {
    query: GetUnreadChatThreadIdsDocument,
    variables: { threadIds: [THREAD_ID] },
  },
  result,
});

const createWrapper =
  (mocks: readonly unknown[]) =>
  ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks as never}>
      <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
    </MockedProvider>
  );

describe('AiChatUnreadThreadsTracker', () => {
  beforeEach(() => {
    resetJotaiStore();
    threads = [
      {
        id: THREAD_ID,
        lastMessageAt: '2026-09-19T10:00:00.000Z',
        updatedAt: '2026-09-19T10:00:00.000Z',
      },
    ];
  });

  it('asks again once a listed conversation has new activity', async () => {
    const readResult = jest.fn(() => ({
      data: { unreadChatThreadIds: [] as string[] },
    }));
    const unreadResult = jest.fn(() => ({
      data: { unreadChatThreadIds: [THREAD_ID] },
    }));

    const { rerender } = render(<AiChatUnreadThreadsTracker />, {
      wrapper: createWrapper([
        buildUnreadMock(readResult),
        buildUnreadMock(unreadResult),
      ]),
    });

    await waitFor(() => expect(readResult).toHaveBeenCalled());

    expect(jotaiStore.get(agentChatUnreadThreadIdsState.atom)).toEqual([]);

    threads = [
      {
        id: THREAD_ID,
        lastMessageAt: '2026-09-19T11:00:00.000Z',
        updatedAt: '2026-09-19T11:00:00.000Z',
      },
    ];
    rerender(<AiChatUnreadThreadsTracker />);

    await waitFor(() =>
      expect(jotaiStore.get(agentChatUnreadThreadIdsState.atom)).toEqual([
        THREAD_ID,
      ]),
    );
  });
});
