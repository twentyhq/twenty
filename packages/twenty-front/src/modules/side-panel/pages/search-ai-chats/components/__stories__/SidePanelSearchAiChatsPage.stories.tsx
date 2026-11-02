import { type Meta, type StoryObj } from '@storybook/react-vite';
import { isNonEmptyString } from '@sniptt/guards';
import {
  graphql,
  HttpResponse,
  type GraphQLQuery,
  type GraphQLResponseBody,
} from 'msw';
import { useState } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { CoreObjectNameSingular, SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconMessage, IconSearch } from 'twenty-ui/icon';
import { Text } from 'twenty-ui/primitives/typography';
import { ComponentDecorator } from 'twenty-ui/testing';

import { agentChatDraftsByThreadIdState } from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { SidePanelTopBar } from '@/side-panel/components/SidePanelTopBar';
import { SidePanelSearchAiChatsPage } from '@/side-panel/pages/search-ai-chats/components/SidePanelSearchAiChatsPage';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { WorkspaceSurfaceHeaderPortalContext } from '@/ui/layout/contexts/WorkspaceSurfaceHeaderPortalContext';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { MemoryRouterAppNavigatorProvider } from '~/testing/components/MemoryRouterAppNavigatorProvider';
import { ToastStoryContainer } from '~/testing/components/ToastStoryContainer';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { mockedWorkspaceMemberRecords } from '~/testing/mock-data/generated/data/workspaceMembers/mock-workspaceMembers-data';
import {
  mockCurrentWorkspace,
  mockedUserData,
} from '~/testing/mock-data/users';
import { mockedApolloCoreClient } from '~/testing/mockedApolloCoreClient';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

const RECORD_PATH = '/object/company/20202020-3398-4a80-9e74-000000000001';
const COMMAND_MENU_PAGE_ID = 'command-menu-story';
const PICKER_PAGE_ID = 'search-ai-chats-story';
const CHAT_OBJECT_ID = '20202020-3398-4a80-9e74-000000000002';
const CURRENT_THREAD_ID = '20202020-3398-4a80-9e74-000000000003';
const FIRST_THREAD_ID = '20202020-3398-4a80-9e74-000000000004';
const SECOND_THREAD_ID = '20202020-3398-4a80-9e74-000000000005';
const CHANNEL_THREAD_ID = '20202020-3398-4a80-9e74-000000000006';
const NEXT_PAGE_THREAD_ID = '20202020-3398-4a80-9e74-000000000007';
const OLDER_THREAD_ID = '20202020-3398-4a80-9e74-000000000008';
const CHANNEL_ID = '20202020-3398-4a80-9e74-000000000009';
const RECENT_CHATS_CURSOR = 'recent-chats-page';
const SEARCH_RESULTS_CURSOR = 'search-results-page';
const PAGINATED_SEARCH = 'conversation';
const PRESERVED_DRAFT = '<p>Keep this unsent reply</p>';
const SELECTED_THREAD_UPDATED_AT = '2026-10-21T11:00:00.000Z';

const CHAT_THREADS = [
  {
    id: FIRST_THREAD_ID,
    title: 'Recent company research',
    updatedAt: '2026-10-21T10:00:00.000Z',
  },
  {
    id: SECOND_THREAD_ID,
    title: 'Quarterly planning notes',
    updatedAt: '2026-10-20T10:00:00.000Z',
  },
  {
    id: CHANNEL_THREAD_ID,
    title: 'Unfollowed channel conversation',
    updatedAt: '2026-10-21T12:00:00.000Z',
  },
  {
    id: NEXT_PAGE_THREAD_ID,
    title: 'Next page conversation',
    updatedAt: '2026-10-19T10:00:00.000Z',
  },
  {
    id: OLDER_THREAD_ID,
    title: 'Older conversation beyond loaded history',
    updatedAt: '2026-10-01T10:00:00.000Z',
  },
];
const RECENT_THREAD_IDS = [
  FIRST_THREAD_ID,
  SECOND_THREAD_ID,
  CHANNEL_THREAD_ID,
];
const SEARCH_RESULT_THREAD_IDS_BY_PATTERN: Record<string, string[]> = {
  '%Older%': [OLDER_THREAD_ID],
  '%channel%': [CHANNEL_THREAD_ID],
};

type PendingResponse = {
  promise: Promise<void>;
  release: () => void;
};

const createPendingResponse = (): PendingResponse => {
  let release = () => {};
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });

  return { promise, release };
};

const findChats = fn();
let pendingSelectedThread: PendingResponse | undefined;
let pendingSearch: PendingResponse | undefined;
let pendingRecentChatsNextPage: PendingResponse | undefined;
let pendingSearchResultsNextPage: PendingResponse | undefined;
let hasDeliveredSearchResultsNextPage = false;
let shouldFailSearch = false;
let shouldFailSelection = false;
let unavailableThreadId: string | undefined;

type ChatQueryVariables = {
  filter?: {
    title?: { ilike?: string };
    and?: { id?: { eq?: string } }[];
  };
  lastCursor?: string;
};

const getChatPageResponse = ({
  threadIds,
  nextPageCursor,
  updatedAt,
}: {
  threadIds: string[];
  nextPageCursor?: string;
  updatedAt?: string;
}) => {
  const threads = CHAT_THREADS.filter(({ id }) => threadIds.includes(id));

  return HttpResponse.json<GraphQLResponseBody<GraphQLQuery>>({
    data: {
      agentChatThreads: {
        __typename: 'AgentChatThreadConnection',
        edges: threads.map((thread) => ({
          __typename: 'AgentChatThreadEdge',
          node: {
            __typename: 'AgentChatThread',
            ...thread,
            createdAt: '2026-10-01T10:00:00.000Z',
            updatedAt: updatedAt ?? thread.updatedAt,
            deletedAt: null,
          },
          cursor: thread.id,
        })),
        pageInfo: {
          __typename: 'PageInfo',
          hasNextPage: isDefined(nextPageCursor),
          hasPreviousPage: false,
          startCursor: threads.at(0)?.id ?? null,
          endCursor: nextPageCursor ?? threads.at(-1)?.id ?? null,
        },
        totalCount: threads.length,
      },
    },
  });
};

const getSearchResponse = async ({
  titlePattern,
  lastCursor,
}: {
  titlePattern: string;
  lastCursor?: string;
}) => {
  if (lastCursor === SEARCH_RESULTS_CURSOR) {
    await pendingSearchResultsNextPage?.promise;
    hasDeliveredSearchResultsNextPage = true;

    return getChatPageResponse({ threadIds: [NEXT_PAGE_THREAD_ID] });
  }

  await pendingSearch?.promise;

  if (shouldFailSearch) {
    return HttpResponse.json<GraphQLResponseBody<GraphQLQuery>>({
      errors: [{ message: 'Could not search chats' }],
    });
  }

  if (titlePattern === `%${PAGINATED_SEARCH}%`) {
    return getChatPageResponse({
      threadIds: [OLDER_THREAD_ID],
      nextPageCursor: SEARCH_RESULTS_CURSOR,
    });
  }

  return getChatPageResponse({
    threadIds: SEARCH_RESULT_THREAD_IDS_BY_PATTERN[titlePattern] ?? [],
  });
};

const SearchAiChatsStory = () => {
  const [headerActionsPortal, setHeaderActionsPortal] =
    useState<HTMLElement | null>(null);
  const { pathname } = useLocation();
  const navigationStack = useAtomStateValue(sidePanelNavigationStackState);
  const currentPage = navigationStack.at(-1);

  return (
    <ToastStoryContainer>
      <SidePanelPageComponentInstanceContext.Provider
        value={{ instanceId: currentPage?.pageId ?? PICKER_PAGE_ID }}
      >
        <WorkspaceSurfaceHeaderPortalContext.Provider
          value={{ title: null, actions: headerActionsPortal }}
        >
          <Text data-testid="underlying-record-path">{pathname}</Text>
          {currentPage?.page === SidePanelPages.AskAI ? (
            <Text>Conversation opened in the side panel</Text>
          ) : (
            <SidePanelTopBar setHeaderActionsPortal={setHeaderActionsPortal} />
          )}
          {currentPage?.page === SidePanelPages.CommandMenuDisplay && (
            <Text>Command menu</Text>
          )}
          {currentPage?.page === SidePanelPages.SearchAiChats && (
            <SidePanelSearchAiChatsPage />
          )}
        </WorkspaceSurfaceHeaderPortalContext.Provider>
      </SidePanelPageComponentInstanceContext.Provider>
    </ToastStoryContainer>
  );
};

const meta = {
  title: 'Modules/SidePanel/SearchAiChatsPage',
  component: SearchAiChatsStory,
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={[RECORD_PATH]}>
        <MemoryRouterAppNavigatorProvider>
          <Story />
        </MemoryRouterAppNavigatorProvider>
      </MemoryRouter>
    ),
    ComponentDecorator,
    ToastDecorator,
  ],
  parameters: {
    container: { width: 400, height: 600 },
    msw: {
      handlers: [
        graphql.query<GraphQLQuery, ChatQueryVariables>(
          'FindManyAgentChatThreads',
          async ({ variables }) => {
            findChats(variables);

            const selectedThreadId = variables.filter?.and?.find((filter) =>
              isDefined(filter.id),
            )?.id?.eq;

            if (isDefined(selectedThreadId)) {
              await pendingSelectedThread?.promise;

              if (shouldFailSelection) {
                return HttpResponse.json<GraphQLResponseBody<GraphQLQuery>>({
                  errors: [{ message: 'Could not load the selected chat' }],
                });
              }

              return getChatPageResponse({
                threadIds:
                  selectedThreadId === unavailableThreadId
                    ? []
                    : [selectedThreadId],
                updatedAt: SELECTED_THREAD_UPDATED_AT,
              });
            }

            const titlePattern = variables.filter?.title?.ilike;

            if (isNonEmptyString(titlePattern)) {
              return getSearchResponse({
                titlePattern,
                lastCursor: variables.lastCursor,
              });
            }

            if (variables.lastCursor === RECENT_CHATS_CURSOR) {
              await pendingRecentChatsNextPage?.promise;

              return getChatPageResponse({ threadIds: [NEXT_PAGE_THREAD_ID] });
            }

            return getChatPageResponse({
              threadIds: RECENT_THREAD_IDS,
              nextPageCursor: RECENT_CHATS_CURSOR,
            });
          },
        ),
        graphql.query('GetRecordPermissions', () =>
          HttpResponse.json<GraphQLResponseBody<GraphQLQuery>>({
            data: {
              recordPermissions: [
                {
                  objectMetadataId: CHAT_OBJECT_ID,
                  recordId: FIRST_THREAD_ID,
                  permissions: {
                    canRead: true,
                    canUpdate: true,
                    canDelete: true,
                    canSoftDelete: true,
                  },
                },
              ],
            },
          }),
        ),
      ],
    },
  },
  beforeEach: async () => {
    await mockedApolloCoreClient.clearStore();
    findChats.mockClear();
    pendingSelectedThread = undefined;
    pendingSearch = undefined;
    pendingRecentChatsNextPage = undefined;
    pendingSearchResultsNextPage = undefined;
    hasDeliveredSearchResultsNextPage = false;
    shouldFailSearch = false;
    shouldFailSelection = false;
    unavailableThreadId = undefined;

    for (const { id } of CHAT_THREADS) {
      jotaiStore.set(recordStoreFamilyState.atomFamily(id), null);
    }

    for (const thread of CHAT_THREADS.filter(({ id }) =>
      RECENT_THREAD_IDS.includes(id),
    )) {
      jotaiStore.set(recordStoreFamilyState.atomFamily(thread.id), {
        __typename: 'AgentChatThread',
        ...thread,
        createdAt: '2026-10-01T10:00:00.000Z',
        deletedAt: null,
        lastActivityAt: thread.updatedAt,
        channelId: thread.id === CHANNEL_THREAD_ID ? CHANNEL_ID : null,
      });
    }

    jotaiStore.set(agentChatThreadListState.atom, {
      threadIds: RECENT_THREAD_IDS,
      hasNextPage: true,
      endCursor: RECENT_CHATS_CURSOR,
    });
    jotaiStore.set(agentChatThreadParticipantsState.atom, {});

    const noteMetadata = getMockObjectMetadataItemOrThrow(
      CoreObjectNameSingular.Note,
    );
    const chatFields = noteMetadata.fields.filter((field) =>
      ['id', 'title', 'createdAt', 'updatedAt', 'deletedAt'].includes(
        field.name,
      ),
    );
    const chatMetadata: EnrichedObjectMetadataItem = {
      ...noteMetadata,
      id: CHAT_OBJECT_ID,
      nameSingular: CoreObjectNameSingular.AgentChatThread,
      namePlural: 'agentChatThreads',
      labelSingular: 'Chat',
      labelPlural: 'Chats',
      fields: chatFields,
      readableFields: chatFields,
      updatableFields: chatFields,
      indexMetadatas: [],
      searchFieldMetadatas: [],
    };

    setTestObjectMetadataItemsInMetadataStore(jotaiStore, [chatMetadata]);
    jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);
    jotaiStore.set(
      currentUserWorkspaceState.atom,
      mockedUserData.currentUserWorkspace,
    );
    jotaiStore.set(
      currentWorkspaceMemberState.atom,
      getRecordFromRecordNode<WorkspaceMember>({
        recordNode: mockedWorkspaceMemberRecords[0],
      }),
    );
    jotaiStore.set(currentAiChatThreadState.atom, CURRENT_THREAD_ID);
    jotaiStore.set(agentChatDraftsByThreadIdState.atom, {
      [CURRENT_THREAD_ID]: PRESERVED_DRAFT,
    });
    jotaiStore.set(sidePanelSearchState.atom, '');
    jotaiStore.set(isSidePanelOpenedState.atom, true);
    jotaiStore.set(sidePanelNavigationStackState.atom, [
      {
        page: SidePanelPages.CommandMenuDisplay,
        pageTitle: 'Command menu',
        pageIcon: IconSearch,
        pageId: COMMAND_MENU_PAGE_ID,
      },
      {
        page: SidePanelPages.SearchAiChats,
        pageTitle: 'Open chat',
        pageIcon: IconMessage,
        pageId: PICKER_PAGE_ID,
      },
    ]);

    return () => {
      pendingSelectedThread?.release();
      pendingSearch?.release();
      pendingRecentChatsNextPage?.release();
      pendingSearchResultsNextPage?.release();
    };
  },
} satisfies Meta<typeof SearchAiChatsStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RecentChatsAndLoadMore: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const searchInput = canvas.getByRole('textbox');

    await expect(
      await canvas.findByRole('button', { name: 'Recent company research' }),
    ).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Quarterly planning notes' }),
    ).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: 'Unfollowed channel conversation' }),
    ).not.toBeInTheDocument();
    await expect(searchInput).toHaveFocus();
    await expect(getComputedStyle(searchInput).outlineStyle).toBe('none');
    await expect(findChats).not.toHaveBeenCalled();

    pendingRecentChatsNextPage = createPendingResponse();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Load more chats' }),
    );
    await expect(
      await canvas.findByRole('status', { name: 'Loading more chats...' }),
    ).toBeVisible();
    await expect(searchInput).toHaveFocus();
    await expect(
      canvas.getByRole('button', { name: 'Recent company research' }),
    ).toBeVisible();

    pendingRecentChatsNextPage.release();

    await expect(
      await canvas.findByRole('button', { name: 'Next page conversation' }),
    ).toBeVisible();
    await expect(findChats).toHaveBeenCalledWith(
      expect.objectContaining({ lastCursor: RECENT_CHATS_CURSOR }),
    );
    await expect(
      canvas.queryByRole('button', { name: 'Load more chats' }),
    ).not.toBeInTheDocument();
  },
};

export const SearchChats: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const searchInput = canvas.getByRole('textbox');

    await canvas.findByRole('button', { name: 'Recent company research' });

    await userEvent.type(searchInput, 'Older');
    await expect(
      await canvas.findByRole('button', {
        name: 'Older conversation beyond loaded history',
      }),
    ).toBeVisible();
    await expect(findChats).toHaveBeenCalledWith(
      expect.objectContaining({ filter: { title: { ilike: '%Older%' } } }),
    );
    await expect(
      canvas.queryByRole('button', { name: 'Recent company research' }),
    ).not.toBeInTheDocument();

    await userEvent.clear(searchInput);
    await userEvent.type(searchInput, 'channel');
    await expect(
      await canvas.findByRole('button', {
        name: 'Unfollowed channel conversation',
      }),
    ).toBeVisible();

    await userEvent.clear(searchInput);
    await userEvent.type(searchInput, 'No matching chat');
    await expect(
      await canvas.findByText('No chats match your search'),
    ).toBeVisible();

    await userEvent.clear(searchInput);
    await expect(
      await canvas.findByRole('button', { name: 'Recent company research' }),
    ).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: 'Unfollowed channel conversation' }),
    ).not.toBeInTheDocument();
  },
};

export const Searching: Story = {
  beforeEach: () => {
    pendingSearch = createPendingResponse();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByRole('textbox'), 'Older');
    await waitFor(() =>
      expect(findChats).toHaveBeenCalledWith(
        expect.objectContaining({ filter: { title: { ilike: '%Older%' } } }),
      ),
    );
    await expect(
      canvas.getByRole('status', { name: 'Searching chats...' }),
    ).toBeVisible();
    await expect(
      canvas.queryByText('No chats match your search'),
    ).not.toBeInTheDocument();

    pendingSearch?.release();

    await expect(
      await canvas.findByRole('button', {
        name: 'Older conversation beyond loaded history',
      }),
    ).toBeVisible();
  },
};

export const LoadMoreStaysWithItsSearch: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const searchInput = canvas.getByRole('textbox');

    await userEvent.type(searchInput, PAGINATED_SEARCH);
    await canvas.findByRole('button', {
      name: 'Older conversation beyond loaded history',
    });

    pendingSearchResultsNextPage = createPendingResponse();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Load more chats' }),
    );
    await waitFor(() =>
      expect(findChats).toHaveBeenCalledWith(
        expect.objectContaining({ lastCursor: SEARCH_RESULTS_CURSOR }),
      ),
    );

    await userEvent.clear(searchInput);
    await userEvent.type(searchInput, 'Older');
    await waitFor(() =>
      expect(findChats).toHaveBeenCalledWith(
        expect.objectContaining({ filter: { title: { ilike: '%Older%' } } }),
      ),
    );
    await expect(
      await canvas.findByRole('button', {
        name: 'Older conversation beyond loaded history',
      }),
    ).toBeVisible();

    pendingSearchResultsNextPage.release();
    await waitFor(() => expect(hasDeliveredSearchResultsNextPage).toBe(true));
    await new Promise((resolve) => setTimeout(resolve, 200));

    await expect(
      canvas.queryByRole('button', { name: 'Next page conversation' }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByRole('button', { name: 'Load more chats' }),
    ).not.toBeInTheDocument();
  },
};

export const OpenChatWithKeyboard: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await canvas.findByRole('button', { name: 'Quarterly planning notes' });
    await expect(canvas.getByRole('textbox')).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');

    await expect(
      await canvas.findByText('Conversation opened in the side panel'),
    ).toBeVisible();
    await waitFor(() =>
      expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(
        SECOND_THREAD_ID,
      ),
    );
    await expect(
      canvas.getByTestId('underlying-record-path'),
    ).toHaveTextContent(RECORD_PATH);
    await expect(
      jotaiStore.get(agentChatDraftsByThreadIdState.atom)[CURRENT_THREAD_ID],
    ).toBe(PRESERVED_DRAFT);
  },
};

export const LeaveWhileOpening: Story = {
  beforeEach: () => {
    pendingSelectedThread = createPendingResponse();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const selectedChat = await canvas.findByRole('button', {
      name: 'Recent company research',
    });
    const otherChat = canvas.getByRole('button', {
      name: 'Quarterly planning notes',
    });
    const rowTopBeforeOpening = selectedChat.getBoundingClientRect().top;
    await userEvent.click(selectedChat);
    const openingIndicator = await canvas.findByRole('status', {
      name: 'Opening chat...',
    });
    const searchInputBounds = canvas
      .getByRole('textbox')
      .getBoundingClientRect();
    const indicatorBounds = openingIndicator.getBoundingClientRect();
    await expect(openingIndicator).toBeVisible();
    await expect(indicatorBounds.top).toBeGreaterThanOrEqual(
      searchInputBounds.top,
    );
    await expect(indicatorBounds.bottom).toBeLessThanOrEqual(
      searchInputBounds.bottom,
    );
    await expect(selectedChat.getBoundingClientRect().top).toBe(
      rowTopBeforeOpening,
    );
    await expect(selectedChat).toHaveAttribute('aria-disabled', 'true');
    await expect(otherChat).toHaveAttribute('aria-disabled', 'true');

    await userEvent.click(otherChat);
    await userEvent.click(canvas.getByRole('button', { name: 'Back' }));
    await expect(await canvas.findByText('Command menu')).toBeVisible();

    pendingSelectedThread?.release();

    await waitFor(() =>
      expect(
        jotaiStore.get(
          agentChatThreadRecordFamilySelector.selectorFamily(FIRST_THREAD_ID),
        ),
      ).toMatchObject({
        id: FIRST_THREAD_ID,
        updatedAt: SELECTED_THREAD_UPDATED_AT,
      }),
    );
    await expect(findChats).not.toHaveBeenCalledWith(
      expect.objectContaining({
        filter: expect.objectContaining({
          and: expect.arrayContaining([{ id: { eq: SECOND_THREAD_ID } }]),
        }),
      }),
    );
    await expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(
      CURRENT_THREAD_ID,
    );
    await expect(
      jotaiStore.get(sidePanelNavigationStackState.atom).at(-1)?.page,
    ).toBe(SidePanelPages.CommandMenuDisplay);
    await expect(
      canvas.queryByText('Conversation opened in the side panel'),
    ).not.toBeInTheDocument();
  },
};

export const FailedOpen: Story = {
  beforeEach: () => {
    shouldFailSelection = true;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const searchInput = canvas.getByRole('textbox');

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Recent company research' }),
    );
    await expect(
      await canvas.findByText(
        'This chat could not be opened. Try selecting it again.',
      ),
    ).toBeVisible();
    await expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(
      CURRENT_THREAD_ID,
    );
    await expect(
      canvas.queryByRole('status', { name: 'Opening chat...' }),
    ).not.toBeInTheDocument();

    await userEvent.type(searchInput, 'Older');
    await canvas.findByRole('button', {
      name: 'Older conversation beyond loaded history',
    });
    await expect(
      canvas.queryByText(
        'This chat could not be opened. Try selecting it again.',
      ),
    ).not.toBeInTheDocument();

    await userEvent.clear(searchInput);
    shouldFailSelection = false;
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Recent company research' }),
    );

    await expect(
      await canvas.findByText('Conversation opened in the side panel'),
    ).toBeVisible();
  },
};

export const UnavailableChat: Story = {
  beforeEach: () => {
    unavailableThreadId = FIRST_THREAD_ID;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Recent company research' }),
    );

    await expect(
      await canvas.findByText('This chat is no longer available.'),
    ).toBeVisible();
    await expect(
      canvas.queryByRole('button', { name: 'Recent company research' }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Quarterly planning notes' }),
    ).toBeVisible();
    await expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(
      CURRENT_THREAD_ID,
    );
  },
};

export const FailedSearch: Story = {
  beforeEach: () => {
    shouldFailSearch = true;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByRole('textbox'), 'Older');

    await expect(await canvas.findByText('An error occurred.')).toBeVisible();
    await expect(canvas.getAllByText('An error occurred.')).toHaveLength(1);
    await expect(
      canvas.queryByText('No chats match your search'),
    ).not.toBeInTheDocument();

    shouldFailSearch = false;
    await userEvent.click(canvas.getByRole('button', { name: 'Retry search' }));

    await expect(
      await canvas.findByRole('button', {
        name: 'Older conversation beyond loaded history',
      }),
    ).toBeVisible();
  },
};

export const NoChatsYet: Story = {
  beforeEach: () => {
    jotaiStore.set(agentChatThreadListState.atom, null);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('status', { name: 'Loading chats...' }),
    ).toBeVisible();

    jotaiStore.set(agentChatThreadListState.atom, {
      threadIds: [],
      hasNextPage: false,
      endCursor: null,
    });

    await expect(await canvas.findByText('No chats yet')).toBeVisible();

    await userEvent.type(canvas.getByRole('textbox'), 'No matching chat');

    await expect(
      await canvas.findByText('No chats match your search'),
    ).toBeVisible();
  },
};
