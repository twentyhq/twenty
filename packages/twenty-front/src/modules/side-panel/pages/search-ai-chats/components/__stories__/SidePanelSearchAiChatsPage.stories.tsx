import { type Meta, type StoryObj } from '@storybook/react-vite';
import { isNonEmptyString } from '@sniptt/guards';
import { graphql, HttpResponse, type GraphQLQuery } from 'msw';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { CoreObjectNameSingular, SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconMessage } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { ComponentDecorator } from 'twenty-ui/testing';

import { agentChatDraftsByThreadIdState } from '@/ai/states/agentChatDraftsByThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { SidePanelTopBar } from '@/side-panel/components/SidePanelTopBar';
import { SidePanelSearchAiChatsPage } from '@/side-panel/pages/search-ai-chats/components/SidePanelSearchAiChatsPage';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { MemoryRouterAppNavigatorProvider } from '~/testing/components/MemoryRouterAppNavigatorProvider';
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
const PREVIOUS_PATH = '/home';
const PICKER_PAGE_ID = 'search-ai-chats-story';
const CHAT_OBJECT_ID = '20202020-3398-4a80-9e74-000000000002';
const CURRENT_THREAD_ID = '20202020-3398-4a80-9e74-000000000003';
const FIRST_THREAD_ID = '20202020-3398-4a80-9e74-000000000004';
const SECOND_THREAD_ID = '20202020-3398-4a80-9e74-000000000005';
const SEARCH_THREAD_ID = '20202020-3398-4a80-9e74-000000000006';
const FIRST_PAGE_CURSOR = 'first-chat-page';
const PRESERVED_DRAFT = '<p>Keep this unsent reply</p>';
const findChats = fn();
let pendingSelectedThreadResponse: Promise<void> | undefined;
let releaseSelectedThreadResponse: (() => void) | undefined;

const chatThreads = [
  { id: FIRST_THREAD_ID, title: 'Recent company research' },
  { id: SECOND_THREAD_ID, title: 'Next page conversation' },
  { id: SEARCH_THREAD_ID, title: 'Older conversation beyond loaded history' },
];

type ChatQueryVariables = {
  filter?: {
    title?: { ilike?: string };
    and?: { id?: { eq?: string } }[];
  };
  lastCursor?: string;
};

const getChatPageResponse = ({
  threads,
  hasNextPage = false,
  totalCount = threads.length,
}: {
  threads: typeof chatThreads;
  hasNextPage?: boolean;
  totalCount?: number;
}) =>
  HttpResponse.json({
    data: {
      agentChatThreads: {
        __typename: 'AgentChatThreadConnection',
        edges: threads.map((thread) => ({
          __typename: 'AgentChatThreadEdge',
          node: {
            __typename: 'AgentChatThread',
            ...thread,
            createdAt: '2026-10-01T10:00:00.000Z',
            updatedAt: '2026-10-21T10:00:00.000Z',
            deletedAt: null,
          },
          cursor: thread.id,
        })),
        pageInfo: {
          __typename: 'PageInfo',
          hasNextPage,
          hasPreviousPage: false,
          startCursor: threads.at(0)?.id ?? null,
          endCursor: hasNextPage
            ? FIRST_PAGE_CURSOR
            : (threads.at(-1)?.id ?? null),
        },
        totalCount,
      },
    },
  });

type SearchAiChatsStoryProps = {
  hasBackControl?: boolean;
};

const SearchAiChatsStory = ({
  hasBackControl = false,
}: SearchAiChatsStoryProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const navigationStack = useAtomStateValue(sidePanelNavigationStackState);
  const isChatOpen = navigationStack.at(-1)?.page === SidePanelPages.AskAI;
  const pageId = navigationStack.at(-1)?.pageId ?? PICKER_PAGE_ID;

  return (
    <SidePanelPageComponentInstanceContext.Provider
      value={{ instanceId: pageId }}
    >
      <Text data-testid="underlying-record-path">{pathname}</Text>
      {hasBackControl && (
        <Button onClick={() => navigate(-1)}>Browser Back</Button>
      )}
      <SidePanelTopBar />
      {isChatOpen ? (
        <Text>Conversation opened in the side panel</Text>
      ) : (
        <SidePanelSearchAiChatsPage />
      )}
    </SidePanelPageComponentInstanceContext.Provider>
  );
};

const meta = {
  title: 'Modules/SidePanel/SearchAiChatsPage',
  component: SearchAiChatsStory,
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={[PREVIOUS_PATH, RECORD_PATH]}>
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
              await pendingSelectedThreadResponse;

              return getChatPageResponse({
                threads: chatThreads.filter(
                  (thread) => thread.id === selectedThreadId,
                ),
              });
            }

            if (variables.filter?.title?.ilike === '%Older%') {
              return getChatPageResponse({
                threads: chatThreads.filter(
                  (thread) => thread.id === SEARCH_THREAD_ID,
                ),
              });
            }

            if (isNonEmptyString(variables.filter?.title?.ilike)) {
              return getChatPageResponse({ threads: [] });
            }

            if (variables.lastCursor === FIRST_PAGE_CURSOR) {
              return getChatPageResponse({
                threads: chatThreads.filter(
                  (thread) => thread.id !== FIRST_THREAD_ID,
                ),
                totalCount: chatThreads.length,
              });
            }

            return getChatPageResponse({
              threads: chatThreads.filter(
                (thread) => thread.id === FIRST_THREAD_ID,
              ),
              hasNextPage: true,
              totalCount: chatThreads.length,
            });
          },
        ),
        graphql.query('GetRecordPermissions', () =>
          HttpResponse.json({
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
    pendingSelectedThreadResponse = undefined;
    releaseSelectedThreadResponse = undefined;

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
        page: SidePanelPages.SearchAiChats,
        pageTitle: 'Open chat',
        pageIcon: IconMessage,
        pageId: PICKER_PAGE_ID,
      },
    ]);
  },
} satisfies Meta<typeof SearchAiChatsStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SearchPaginationAndSelection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const searchInput = canvas.getByRole('textbox');

    await expect(
      await canvas.findByRole('button', { name: 'Recent company research' }),
    ).toBeVisible();
    await expect(
      canvas.queryByText('Older conversation beyond loaded history'),
    ).not.toBeInTheDocument();

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
    await userEvent.type(searchInput, 'No matching chat');
    await expect(
      await canvas.findByText('No chats match your search'),
    ).toBeVisible();

    await userEvent.clear(searchInput);
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Load more chats' }),
    );
    await expect(
      await canvas.findByRole('button', { name: 'Next page conversation' }),
    ).toBeVisible();
    await expect(findChats).toHaveBeenCalledWith(
      expect.objectContaining({ lastCursor: FIRST_PAGE_CURSOR }),
    );
    await expect(
      canvas.queryByRole('button', { name: 'Load more chats' }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Recent company research' }),
    );
    await expect(
      await canvas.findByText('Conversation opened in the side panel'),
    ).toBeVisible();
    await waitFor(() =>
      expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(
        FIRST_THREAD_ID,
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

export const BackDuringPendingSelection: Story = {
  args: { hasBackControl: true },
  beforeEach: () => {
    pendingSelectedThreadResponse = new Promise<void>((resolve) => {
      releaseSelectedThreadResponse = resolve;
    });

    return () => releaseSelectedThreadResponse?.();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      await canvas.findByRole('button', { name: 'Recent company research' }),
    );
    await expect(await canvas.findByText('Opening chat...')).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'Browser Back' }));
    await waitFor(() =>
      expect(canvas.getByTestId('underlying-record-path')).toHaveTextContent(
        PREVIOUS_PATH,
      ),
    );

    releaseSelectedThreadResponse?.();

    await waitFor(() =>
      expect(
        jotaiStore.get(
          agentChatThreadRecordFamilySelector.selectorFamily(FIRST_THREAD_ID),
        ),
      ).toMatchObject({ id: FIRST_THREAD_ID }),
    );
    await expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(
      CURRENT_THREAD_ID,
    );
    await expect(
      jotaiStore.get(sidePanelNavigationStackState.atom).at(-1)?.page,
    ).toBe(SidePanelPages.SearchAiChats);
    await expect(
      canvas.queryByText('Conversation opened in the side panel'),
    ).not.toBeInTheDocument();
  },
};
