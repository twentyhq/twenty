import { act, renderHook } from '@testing-library/react';
import { atom, createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useFetchMoreAgentChatThreads } from '@/ai/hooks/useFetchMoreAgentChatThreads';
import { useFetchMoreAgentChatThreadsInFilterStatus } from '@/ai/hooks/useFetchMoreAgentChatThreadsInFilterStatus';
import { useRefreshAgentChatThreadsInFilterStatus } from '@/ai/hooks/useRefreshAgentChatThreadsInFilterStatus';
import { useRefreshAgentChatThreads } from '@/ai/hooks/useRefreshAgentChatThreads';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import {
  mockedUserData,
  mockedWorkspaceMemberData,
} from '~/testing/mock-data/users';

const queryMock = jest.fn();
const mockApolloCoreClient = { query: queryMock };

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => mockApolloCoreClient,
}));

const chatObjectMetadataItemAtom = atom({
  id: 'chat-object',
  nameSingular: 'agentChatThread',
  namePlural: 'agentChatThreads',
  fields: [{ name: 'title' }, { name: 'lastActivityAt' }],
  readableFields: [{ name: 'title' }],
});

jest.mock('@/object-metadata/states/objectMetadataItemFamilySelector', () => ({
  objectMetadataItemFamilySelector: {
    type: 'FamilySelector',
    selectorFamily: () => chatObjectMetadataItemAtom,
  },
}));

jest.mock('@/object-record/utils/generateFindManyRecordsQuery', () => ({
  generateFindManyRecordsQuery: () => 'find-many-agent-chat-threads',
}));

const refreshAgentChatThreadPermissions = jest.fn();

jest.mock('@/ai/hooks/useRefreshAgentChatThreadPermissions', () => ({
  useRefreshAgentChatThreadPermissions: () => ({
    refreshAgentChatThreadPermissions,
  }),
}));

const buildThread = ({
  id,
  title,
}: {
  id: string;
  title: string;
}): AgentChatThreadRecord => ({
  __typename: 'AgentChatThread',
  id,
  title,
  deletedAt: null,
  createdAt: '2026-09-07T00:00:00.000Z',
  updatedAt: '2026-09-07T00:00:00.000Z',
});

const buildPage = (
  threads: AgentChatThreadRecord[],
  { hasNextPage = false, endCursor = 'end' } = {},
) => ({
  data: {
    agentChatThreads: {
      edges: threads.map((thread) => ({ node: thread, cursor: thread.id })),
      pageInfo: {
        hasNextPage,
        hasPreviousPage: false,
        startCursor: 'start',
        endCursor,
      },
      totalCount: threads.length,
    },
  },
});

const buildStore = () => {
  const store = createStore();

  store.set(currentUserWorkspaceState.atom, {
    ...mockedUserData.currentUserWorkspace,
    permissionFlags: [PermissionFlagType.AI],
  });

  return store;
};

const getWrapper = (store: ReturnType<typeof createStore>) =>
  function Wrapper({ children }: { children: ReactNode }) {
    return <JotaiProvider store={store}>{children}</JotaiProvider>;
  };

const renderChatThreadLoadingHook = <THookResult,>({
  store,
  hook,
}: {
  store: ReturnType<typeof createStore>;
  hook: () => THookResult;
}) => renderHook(hook, { wrapper: getWrapper(store) }).result;

describe('inbox tab pages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    refreshAgentChatThreadPermissions.mockResolvedValue(undefined);
  });

  const buildStoreWithList = () => {
    const store = buildStore();

    store.set(currentWorkspaceMemberState.atom, mockedWorkspaceMemberData);
    store.set(agentChatThreadListState.atom, {
      threadIds: ['recent-thread'],
      hasNextPage: true,
      endCursor: 'all-chats-page-1',
    });

    return store;
  };

  it("adds the tab's chats to the list, past the pages of every chat", async () => {
    const store = buildStoreWithList();
    queryMock.mockResolvedValue(
      buildPage(
        [
          buildThread({ id: 'recent-thread', title: 'Recent' }),
          buildThread({ id: 'old-open-thread', title: 'Old' }),
        ],
        { hasNextPage: true, endCursor: 'tab-page-1' },
      ),
    );
    const result = renderChatThreadLoadingHook({
      store,
      hook: useRefreshAgentChatThreadsInFilterStatus,
    });

    await act(async () => {
      await result.current.refreshAgentChatThreadsInFilterStatus('active');
    });

    expect(queryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          lastCursor: null,
          filter: {
            and: [
              expect.anything(),
              {
                and: [
                  { deletedAt: { is: 'NULL' } },
                  expect.objectContaining({
                    participants: expect.objectContaining({
                      workspaceMemberId: { eq: mockedWorkspaceMemberData.id },
                    }),
                  }),
                ],
              },
            ],
          },
        }),
      }),
    );
    expect(store.get(agentChatThreadListState.atom)).toEqual({
      threadIds: ['recent-thread'],
      hasNextPage: true,
      endCursor: 'all-chats-page-1',
      filterStatusPages: {
        active: {
          threadIds: ['recent-thread', 'old-open-thread'],
          hasNextPage: true,
          endCursor: 'tab-page-1',
        },
      },
    });
  });

  it('continues a tab from its own cursor, and stops once the tab is loaded', async () => {
    const store = buildStoreWithList();
    store.set(agentChatThreadListState.atom, {
      threadIds: ['recent-thread'],
      hasNextPage: true,
      endCursor: 'all-chats-page-1',
      filterStatusPages: {
        done: {
          threadIds: ['earlier-done-thread'],
          hasNextPage: true,
          endCursor: 'done-page-1',
        },
        active: { threadIds: [], hasNextPage: false, endCursor: null },
      },
    });
    queryMock.mockResolvedValue(
      buildPage([buildThread({ id: 'done-thread', title: 'Done' })], {
        endCursor: 'done-page-2',
      }),
    );
    const result = renderChatThreadLoadingHook({
      store,
      hook: useFetchMoreAgentChatThreadsInFilterStatus,
    });

    await act(async () => {
      await result.current.fetchMoreAgentChatThreadsInFilterStatus('active');
    });

    expect(queryMock).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.fetchMoreAgentChatThreadsInFilterStatus('done');
    });

    expect(queryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({ lastCursor: 'done-page-1' }),
      }),
    );
    expect(
      store.get(agentChatThreadListState.atom)?.filterStatusPages?.done,
    ).toEqual({
      threadIds: ['earlier-done-thread', 'done-thread'],
      hasNextPage: false,
      endCursor: 'done-page-2',
    });
  });

  it('keeps paging a tab while its pages only hold chats the list already has', async () => {
    const store = buildStoreWithList();
    store.set(agentChatThreadListState.atom, {
      threadIds: ['recent-thread'],
      hasNextPage: true,
      endCursor: 'all-chats-page-1',
      filterStatusPages: {
        assigned: {
          threadIds: [],
          hasNextPage: true,
          endCursor: 'assigned-page-1',
        },
      },
    });
    queryMock
      .mockResolvedValueOnce(
        buildPage([buildThread({ id: 'recent-thread', title: 'Recent' })], {
          hasNextPage: true,
          endCursor: 'assigned-page-2',
        }),
      )
      .mockResolvedValue(
        buildPage([buildThread({ id: 'older-thread', title: 'Older' })], {
          endCursor: 'assigned-page-3',
        }),
      );
    const result = renderChatThreadLoadingHook({
      store,
      hook: useFetchMoreAgentChatThreadsInFilterStatus,
    });

    await act(async () => {
      await result.current.fetchMoreAgentChatThreadsInFilterStatus('assigned');
    });

    expect(queryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({ lastCursor: 'assigned-page-2' }),
      }),
    );
    expect(store.get(agentChatThreadListState.atom)).toMatchObject({
      threadIds: ['recent-thread'],
      filterStatusPages: {
        assigned: {
          threadIds: ['recent-thread', 'older-thread'],
          hasNextPage: false,
          endCursor: 'assigned-page-3',
        },
      },
    });
  });

  it('starts the tabs over when the list is refreshed', async () => {
    const store = buildStoreWithList();
    store.set(agentChatThreadListState.atom, {
      threadIds: ['recent-thread'],
      hasNextPage: true,
      endCursor: 'all-chats-page-1',
      filterStatusPages: {
        active: {
          threadIds: ['old-open-thread'],
          hasNextPage: false,
          endCursor: null,
        },
      },
    });
    queryMock.mockResolvedValue(
      buildPage([buildThread({ id: 'recent-thread', title: 'Recent' })], {
        hasNextPage: true,
      }),
    );
    const result = renderChatThreadLoadingHook({
      store,
      hook: useRefreshAgentChatThreads,
    });

    await act(async () => {
      await result.current.refreshAgentChatThreads();
    });

    expect(
      store.get(agentChatThreadListState.atom)?.filterStatusPages,
    ).toBeUndefined();
  });

  it('keeps the tab pages when a chat update refreshes the list', async () => {
    const store = buildStoreWithList();
    store.set(agentChatThreadListState.atom, {
      threadIds: ['recent-thread'],
      hasNextPage: true,
      endCursor: 'all-chats-page-1',
      filterStatusPages: {
        done: {
          threadIds: ['done-thread'],
          hasNextPage: true,
          endCursor: 'done-page-1',
        },
      },
    });
    queryMock.mockResolvedValue(
      buildPage([buildThread({ id: 'updated-thread', title: 'Updated' })], {
        hasNextPage: true,
      }),
    );
    const result = renderChatThreadLoadingHook({
      store,
      hook: useRefreshAgentChatThreads,
    });

    await act(async () => {
      await result.current.refreshAgentChatThreads({
        shouldKeepFilterStatusPages: true,
      });
    });

    expect(store.get(agentChatThreadListState.atom)).toMatchObject({
      threadIds: ['updated-thread'],
      filterStatusPages: {
        done: {
          threadIds: ['done-thread'],
          hasNextPage: true,
          endCursor: 'done-page-1',
        },
      },
    });
  });

  it('keeps the tab pages when the next page of every chat loads', async () => {
    const store = buildStoreWithList();
    store.set(agentChatThreadListState.atom, {
      threadIds: ['recent-thread'],
      hasNextPage: true,
      endCursor: 'all-chats-page-1',
      filterStatusPages: {
        done: {
          threadIds: ['done-thread'],
          hasNextPage: true,
          endCursor: 'done-page-1',
        },
      },
    });
    queryMock.mockResolvedValue(
      buildPage([buildThread({ id: 'older-thread', title: 'Older' })]),
    );
    const result = renderChatThreadLoadingHook({
      store,
      hook: useFetchMoreAgentChatThreads,
    });

    await act(async () => {
      await result.current.fetchMoreAgentChatThreads();
    });

    expect(store.get(agentChatThreadListState.atom)).toMatchObject({
      threadIds: ['recent-thread', 'older-thread'],
      filterStatusPages: {
        done: {
          threadIds: ['done-thread'],
          hasNextPage: true,
          endCursor: 'done-page-1',
        },
      },
    });
  });
});
