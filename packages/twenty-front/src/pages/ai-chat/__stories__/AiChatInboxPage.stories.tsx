import { HelmetProvider } from '@dr.pogodin/react-helmet';
import { styled } from '@linaria/react';
import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { MotionGlobalConfig } from 'framer-motion';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  AppPath,
  CoreObjectNameSingular,
  SidePanelPages,
} from 'twenty-shared/types';
import {
  assertIsDefinedOrThrow,
  getAppPath,
  isDefined,
} from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';
import { themeCssVariables } from 'twenty-ui/theme';
import { v4 as uuidv4 } from 'uuid';

import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { AI_CHAT_INBOX_LAYOUT } from '@/ai/constants/AiChatInboxLayout';
import { AI_CHAT_INBOX_LIST_PANE_WIDTH } from '@/ai/constants/AiChatInboxListPaneWidth';
import { AI_CHAT_NEW_THREAD_PATH_SEGMENT } from '@/ai/constants/AiChatNewThreadPathSegment';
import { useSelectAiChatThread } from '@/ai/hooks/useSelectAiChatThread';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { aiChatInboxLayoutState } from '@/ai/states/aiChatInboxLayoutState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { closingAiChatInboxThreadIdState } from '@/ai/states/closingAiChatInboxThreadIdState';
import { initializeNewAiChatStory } from '@/ai/testing/initializeNewAiChatStory';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { getRecordConnectionFromRecords } from '@/object-record/cache/utils/getRecordConnectionFromRecords';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { AiChatInboxPage } from '~/pages/ai-chat/AiChatInboxPage';
import { MemoryRouterAppNavigatorProvider } from '~/testing/components/MemoryRouterAppNavigatorProvider';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

const FIRST_THREAD_ID = '20202020-0000-4000-8000-0000000000aa';
const SECOND_THREAD_ID = '20202020-0000-4000-8000-0000000000bb';
const FIRST_THREAD_TITLE = 'Qualify the lead';
const SECOND_THREAD_TITLE = 'Prepare the customer call';
const THREAD_ACTIVITY_AT = '2026-10-21T09:00:00.000Z';
const THREAD_ARCHIVED_AT = '2026-10-21T11:00:00.000Z';
const CHAT_OBJECT_METADATA_ID = '20202020-0000-4000-8000-0000000000cc';
const CHAT_TARGET_OBJECT_METADATA_ID = '20202020-0000-4000-8000-0000000000dd';
const CHAT_FIELD_NAMES = ['id', 'title', 'createdAt', 'updatedAt', 'deletedAt'];
const NEW_CHAT_PATH = getAppPath(AppPath.AiChatInbox, {
  threadId: AI_CHAT_NEW_THREAD_PATH_SEGMENT,
});
const THREADS: AgentChatThreadRecord[] = [
  {
    __typename: 'AgentChatThread',
    id: FIRST_THREAD_ID,
    title: FIRST_THREAD_TITLE,
    createdAt: THREAD_ACTIVITY_AT,
    updatedAt: THREAD_ACTIVITY_AT,
    lastActivityAt: THREAD_ACTIVITY_AT,
    deletedAt: null,
  },
  {
    __typename: 'AgentChatThread',
    id: SECOND_THREAD_ID,
    title: SECOND_THREAD_TITLE,
    createdAt: THREAD_ACTIVITY_AT,
    updatedAt: THREAD_ACTIVITY_AT,
    lastActivityAt: THREAD_ACTIVITY_AT,
    deletedAt: null,
  },
];

const StyledInboxStory = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
`;

const StyledNavigationControls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const InboxRouteNavigation = () => {
  const navigate = useNavigate();
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();
  const { selectAiChatThread } = useSelectAiChatThread();

  return (
    <StyledNavigationControls>
      <Button onClick={() => navigate(NEW_CHAT_PATH)}>
        Open new chat route
      </Button>
      <Button onClick={() => navigate(NEW_CHAT_PATH, { replace: true })}>
        Replace new chat route
      </Button>
      <Button
        onClick={() =>
          navigate(
            getAppPath(AppPath.AiChatInbox, { threadId: SECOND_THREAD_ID }),
            { replace: true },
          )
        }
      >
        Open saved chat route
      </Button>
      <Button
        onClick={() =>
          navigate({ search: '?panel=details' }, { replace: true })
        }
      >
        Change search parameters
      </Button>
      <Button onClick={() => navigate(-1)}>Back through history</Button>
      <Button onClick={() => navigate(1)}>Forward through history</Button>
      <Button onClick={() => openAskAiPage()}>Open Ask AI</Button>
      <Button onClick={() => selectAiChatThread(FIRST_THREAD_ID)}>
        Select first chat for Ask AI
      </Button>
    </StyledNavigationControls>
  );
};

const InboxRouteDecorator: Decorator = (Story) => (
  <HelmetProvider>
    <MemoryRouter
      initialEntries={[getAppPath(AppPath.AiChatInbox, { threadId: null })]}
    >
      <ContextStoreComponentInstanceContext.Provider
        value={{ instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID }}
      >
        <MemoryRouterAppNavigatorProvider>
          <StyledInboxStory>
            <InboxRouteNavigation />
            <Routes>
              <Route path={AppPath.AiChatInbox} element={<Story />} />
            </Routes>
          </StyledInboxStory>
        </MemoryRouterAppNavigatorProvider>
      </ContextStoreComponentInstanceContext.Provider>
    </MemoryRouter>
  </HelmetProvider>
);

const loadChatRecordMetadata = () => {
  const objectMetadataItems = jotaiStore.get(objectMetadataItemsSelector.atom);
  const objectMetadataTemplate = objectMetadataItems.find(
    ({ nameSingular }) => nameSingular === CoreObjectNameSingular.Note,
  );

  assertIsDefinedOrThrow(objectMetadataTemplate);

  const chatObjectDefinitions = [
    {
      id: CHAT_OBJECT_METADATA_ID,
      nameSingular: CoreObjectNameSingular.AgentChatThread,
      namePlural: 'agentChatThreads',
      labelSingular: 'Chat',
      labelPlural: 'Chats',
      labelFieldName: 'title',
      fieldNames: CHAT_FIELD_NAMES,
    },
    {
      id: CHAT_TARGET_OBJECT_METADATA_ID,
      nameSingular: CoreObjectNameSingular.AgentChatThreadTarget,
      namePlural: 'agentChatThreadTargets',
      labelSingular: 'Chat target',
      labelPlural: 'Chat targets',
      labelFieldName: 'id',
      fieldNames: ['id'],
    },
  ];
  const chatObjectMetadataItems = chatObjectDefinitions.map(
    ({ labelFieldName, fieldNames, ...objectDefinition }) => {
      const fields = objectMetadataTemplate.fields
        .filter(({ name }) => fieldNames.includes(name))
        .map((field) => {
          const id = uuidv4();

          return {
            ...field,
            id,
            universalIdentifier: id,
            objectMetadataId: objectDefinition.id,
          };
        });
      const labelField = fields.find(({ name }) => name === labelFieldName);

      assertIsDefinedOrThrow(labelField);

      return {
        ...objectMetadataTemplate,
        ...objectDefinition,
        universalIdentifier: objectDefinition.id,
        labelIdentifierFieldMetadataId: labelField.id,
        isSystem: true,
        isSearchable: false,
        fields,
        readableFields: fields,
        updatableFields: fields,
        indexMetadatas: [],
        searchFieldMetadatas: [],
      };
    },
  );

  setTestObjectMetadataItemsInMetadataStore(jotaiStore, [
    ...objectMetadataItems,
    ...chatObjectMetadataItems,
  ]);
};

const getThreadRow = ({
  canvasElement,
  title,
}: {
  canvasElement: HTMLElement;
  title: string;
}) => {
  const row = within(canvasElement)
    .getAllByText(title)
    .map((element) => element.closest<HTMLDivElement>('[data-selectable-id]'))
    .find(isDefined);

  assertIsDefinedOrThrow(row);

  return row;
};

const archiveThread = (threadId: string) => {
  const participants = jotaiStore.get(agentChatThreadParticipantsState.atom);
  const participant = participants?.[threadId];

  assertIsDefinedOrThrow(participant);

  jotaiStore.set(agentChatThreadParticipantsState.atom, {
    ...participants,
    [threadId]: {
      ...participant,
      archivedAt: THREAD_ARCHIVED_AT,
      updatedAt: THREAD_ARCHIVED_AT,
    },
  });
};

const meta = {
  title: 'Pages/AiChat/AiChatInboxPage',
  component: AiChatInboxPage,
  decorators: [
    InboxRouteDecorator,
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    RootDecorator,
    ToastDecorator,
  ],
  beforeEach: () => {
    initializeNewAiChatStory({ isInboxEnabled: true });
    jotaiStore.set(
      aiChatInboxLayoutState.atom,
      AI_CHAT_INBOX_LAYOUT.RECORD_PAGE,
    );
    jotaiStore.set(
      agentChatThreadFilterStatusState.atom,
      AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE,
    );
    jotaiStore.set(agentChatThreadListState.atom, {
      threadIds: THREADS.map(({ id }) => id),
      hasNextPage: false,
      endCursor: null,
    });
    jotaiStore.set(
      agentChatThreadParticipantsState.atom,
      Object.fromEntries(
        THREADS.map(({ id }) => [
          id,
          {
            id: `participant-${id}`,
            threadId: id,
            isSubscribed: true,
            updatedAt: THREAD_ACTIVITY_AT,
          },
        ]),
      ),
    );

    for (const thread of THREADS) {
      jotaiStore.set(recordStoreFamilyState.atomFamily(thread.id), thread);
    }
  },
  parameters: {
    container: { width: 1200, height: 784 },
    msw: {
      handlers: [
        graphql.query('GetAiChatUsage', () =>
          HttpResponse.json({ data: { aiChatUsage: null } }),
        ),
        graphql.query('MyConnectedAccounts', () =>
          HttpResponse.json({ data: { myConnectedAccounts: [] } }),
        ),
        graphql.query('MyMessageChannels', () =>
          HttpResponse.json({ data: { myMessageChannels: [] } }),
        ),
        graphql.query('MyCalendarChannels', () =>
          HttpResponse.json({ data: { myCalendarChannels: [] } }),
        ),
        graphql.query('FindOneAgentChatThread', ({ variables }) =>
          HttpResponse.json({
            data: {
              agentChatThread:
                THREADS.find(({ id }) => id === variables.objectRecordId) ??
                null,
            },
          }),
        ),
        graphql.query('FindManyAgentChatThreads', () => {
          const objectMetadataItems = jotaiStore.get(
            objectMetadataItemsSelector.atom,
          );
          const objectMetadataItem = objectMetadataItems.find(
            ({ id }) => id === CHAT_OBJECT_METADATA_ID,
          );

          assertIsDefinedOrThrow(objectMetadataItem);

          return HttpResponse.json({
            data: {
              agentChatThreads: getRecordConnectionFromRecords({
                objectMetadataItems,
                objectMetadataItem,
                records: THREADS,
              }),
            },
          });
        }),
      ],
    },
  },
} satisfies Meta<typeof AiChatInboxPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NewChatClearsSelection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    const selectThread = async (title: string) => {
      const row = getThreadRow({ canvasElement, title });

      await user.keyboard('{Control>}');
      await user.click(within(row).getByText(title));
      await user.keyboard('{/Control}');
      await expect(
        within(row).getByRole('checkbox', { name: 'Select chat' }),
      ).toBeChecked();
    };

    const expectThreadUnchecked = async (title: string) => {
      const row = getThreadRow({ canvasElement, title });

      await expect(within(row).getByLabelText('Select chat')).not.toBeChecked();
    };

    await canvas.findByText(FIRST_THREAD_TITLE);
    await selectThread(FIRST_THREAD_TITLE);
    await selectThread(SECOND_THREAD_TITLE);
    await expect(canvas.getByText('2 selected')).toBeVisible();

    await user.click(
      canvas.getByRole('button', { name: 'Open new chat route' }),
    );
    await expect(await canvas.findByRole('textbox')).toBeVisible();
    await user.click(canvas.getByRole('button', { name: 'Show inbox' }));
    await expectThreadUnchecked(FIRST_THREAD_TITLE);
    await expectThreadUnchecked(SECOND_THREAD_TITLE);

    await user.click(canvas.getByRole('button', { name: 'Hide inbox' }));
    await user.click(
      canvas.getByRole('button', { name: 'Back through history' }),
    );
    await canvas.findByText(FIRST_THREAD_TITLE);
    await expectThreadUnchecked(FIRST_THREAD_TITLE);
    await expectThreadUnchecked(SECOND_THREAD_TITLE);
    await expect(
      canvas.getByRole('button', { name: 'New chat' }),
    ).toBeVisible();

    await user.click(
      canvas.getByRole('button', { name: 'Forward through history' }),
    );
    await expect(await canvas.findByRole('textbox')).toBeVisible();
    await user.click(canvas.getByRole('button', { name: 'Show inbox' }));
    const firstThreadRow = getThreadRow({
      canvasElement,
      title: FIRST_THREAD_TITLE,
    });

    await selectThread(FIRST_THREAD_TITLE);
    await expect(canvas.getByText('1 chat selected')).toBeVisible();

    await user.click(
      canvas.getByRole('button', { name: 'Replace new chat route' }),
    );
    await expect(await canvas.findByRole('textbox')).toBeVisible();
    await expectThreadUnchecked(FIRST_THREAD_TITLE);
    await expect(
      getThreadRow({ canvasElement, title: FIRST_THREAD_TITLE }),
    ).toBe(firstThreadRow);
  },
};

export const SavedChatNavigationClearsSelection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    await canvas.findByText(FIRST_THREAD_TITLE);
    loadChatRecordMetadata();
    jotaiStore.set(
      aiChatInboxLayoutState.atom,
      AI_CHAT_INBOX_LAYOUT.SPLIT_VIEW,
    );
    await user.click(
      within(
        getThreadRow({ canvasElement, title: FIRST_THREAD_TITLE }),
      ).getByText(FIRST_THREAD_TITLE),
    );
    await canvas.findByRole('button', { name: 'Chat details' });

    const firstThreadRow = getThreadRow({
      canvasElement,
      title: FIRST_THREAD_TITLE,
    });
    const secondThreadRow = getThreadRow({
      canvasElement,
      title: SECOND_THREAD_TITLE,
    });

    await user.keyboard('{Control>}');
    await user.click(within(secondThreadRow).getByText(SECOND_THREAD_TITLE));
    await user.keyboard('{/Control}');
    await expect(canvas.getByText('2 chats selected')).toBeVisible();

    await user.click(
      canvas.getByRole('button', { name: 'Change search parameters' }),
    );
    await expect(canvas.getByText('2 chats selected')).toBeVisible();
    await expect(
      within(firstThreadRow).getByLabelText('Select chat'),
    ).toBeChecked();
    await expect(
      within(secondThreadRow).getByLabelText('Select chat'),
    ).toBeChecked();

    await user.click(
      canvas.getByRole('button', { name: 'Open saved chat route' }),
    );
    await expect(
      await canvas.findByRole('button', { name: 'Chat details' }),
    ).toBeVisible();
    await expect(
      canvas.queryByText('2 chats selected'),
    ).not.toBeInTheDocument();
    await expect(canvas.getAllByText(SECOND_THREAD_TITLE)).toHaveLength(2);
    await expect(
      within(firstThreadRow).getByLabelText('Select chat'),
    ).not.toBeChecked();
    await expect(
      within(secondThreadRow).getByLabelText('Select chat'),
    ).not.toBeChecked();
    await expect(
      getThreadRow({ canvasElement, title: FIRST_THREAD_TITLE }),
    ).toBe(firstThreadRow);
    await expect(
      getThreadRow({ canvasElement, title: SECOND_THREAD_TITLE }),
    ).toBe(secondThreadRow);
  },
};

export const CloseConversationPane: Story = {
  beforeEach: () => {
    jotaiStore.set(
      aiChatInboxLayoutState.atom,
      AI_CHAT_INBOX_LAYOUT.SPLIT_VIEW,
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    await canvas.findByText(FIRST_THREAD_TITLE);
    loadChatRecordMetadata();

    const list = canvas.getByRole('region', { name: 'Conversation list' });
    const fullListWidth = list.getBoundingClientRect().width;
    const firstThreadRow = getThreadRow({
      canvasElement,
      title: FIRST_THREAD_TITLE,
    });

    await expect(
      canvas.queryByRole('button', { name: 'Chat details' }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Command Menu' }),
    ).toBeVisible();

    await user.click(within(firstThreadRow).getByText(FIRST_THREAD_TITLE));
    await canvas.findByRole('button', { name: 'Chat details' });
    await waitFor(() =>
      expect(list.getBoundingClientRect().width).toBeCloseTo(
        AI_CHAT_INBOX_LIST_PANE_WIDTH,
        0,
      ),
    );

    const splitListWidth = list.getBoundingClientRect().width;
    const conversation = canvas.getByRole('region', { name: 'Conversation' });
    const shouldReduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    await user.click(canvas.getByRole('button', { name: 'Close' }));
    await expect(
      canvas.queryByRole('button', { name: 'Chat details' }),
    ).not.toBeInTheDocument();

    if (!shouldReduceMotion && !MotionGlobalConfig.skipAnimations) {
      await expect(conversation).toBeInTheDocument();
      await expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(
        FIRST_THREAD_ID,
      );
      await expect(conversation).toHaveAttribute('aria-hidden', 'true');
      await waitFor(() => {
        const closingListWidth = list.getBoundingClientRect().width;

        expect(closingListWidth).toBeGreaterThan(splitListWidth);
        expect(closingListWidth).toBeLessThan(fullListWidth);
      });
    }

    await waitFor(() => {
      expect(conversation).not.toBeInTheDocument();
      expect(list.getBoundingClientRect().width).toBeCloseTo(fullListWidth, 0);
      expect(jotaiStore.get(currentAiChatThreadState.atom)).toBeNull();
    });
    await expect(
      getThreadRow({ canvasElement, title: FIRST_THREAD_TITLE }),
    ).toBe(firstThreadRow);
    await expect(jotaiStore.get(aiChatInboxLayoutState.atom)).toBe(
      AI_CHAT_INBOX_LAYOUT.SPLIT_VIEW,
    );
    await expect(
      canvas.getByRole('button', { name: 'Command Menu' }),
    ).toBeVisible();

    await user.keyboard('{ArrowDown}');
    await canvas.findByRole('button', { name: 'Chat details' });
    await expect(canvas.getAllByText(SECOND_THREAD_TITLE)).toHaveLength(2);
    await waitFor(() =>
      expect(list.getBoundingClientRect().width).toBeCloseTo(splitListWidth, 0),
    );

    const reopenedConversation = canvas.getByRole('region', {
      name: 'Conversation',
    });

    jotaiStore.set(isSidePanelOpenedState.atom, true);
    await user.click(canvas.getByRole('button', { name: 'Close' }));
    await waitFor(() => {
      expect(reopenedConversation).not.toBeInTheDocument();
      expect(list.getBoundingClientRect().width).toBeCloseTo(fullListWidth, 0);
      expect(jotaiStore.get(currentAiChatThreadState.atom)).toBeNull();
    });
    await expect(jotaiStore.get(isSidePanelOpenedState.atom)).toBe(true);
  },
};

export const AskAiAfterClosingConversation: Story = {
  beforeEach: () => {
    jotaiStore.set(
      aiChatInboxLayoutState.atom,
      AI_CHAT_INBOX_LAYOUT.SPLIT_VIEW,
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    await canvas.findByText(FIRST_THREAD_TITLE);
    loadChatRecordMetadata();
    await user.click(
      within(
        getThreadRow({ canvasElement, title: FIRST_THREAD_TITLE }),
      ).getByText(FIRST_THREAD_TITLE),
    );
    await canvas.findByRole('button', { name: 'Chat details' });

    const conversation = canvas.getByRole('region', { name: 'Conversation' });

    await user.click(canvas.getByRole('button', { name: 'Close' }));
    await user.click(canvas.getByRole('button', { name: 'Open Ask AI' }));
    await expect(conversation).not.toBeInTheDocument();
    await expect(
      jotaiStore.get(sidePanelNavigationStackState.atom).at(-1)?.page,
    ).toBe(SidePanelPages.AskAI);
    await expect(jotaiStore.get(currentAiChatThreadState.atom)).toBeNull();
    await expect(
      jotaiStore.get(closingAiChatInboxThreadIdState.atom),
    ).toBeNull();

    await user.click(
      canvas.getByRole('button', { name: 'Select first chat for Ask AI' }),
    );
    await user.click(canvas.getByRole('button', { name: 'Open Ask AI' }));
    await waitFor(() => expect(conversation).not.toBeInTheDocument());
    await expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(
      FIRST_THREAD_ID,
    );
  },
};

export const ClosedConversationHistory: Story = {
  beforeEach: () => {
    jotaiStore.set(
      aiChatInboxLayoutState.atom,
      AI_CHAT_INBOX_LAYOUT.SPLIT_VIEW,
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    await canvas.findByText(FIRST_THREAD_TITLE);
    loadChatRecordMetadata();
    await user.click(
      within(
        getThreadRow({ canvasElement, title: FIRST_THREAD_TITLE }),
      ).getByText(FIRST_THREAD_TITLE),
    );
    await canvas.findByRole('button', { name: 'Chat details' });
    await user.click(canvas.getByRole('button', { name: 'Close' }));
    archiveThread(FIRST_THREAD_ID);

    await waitFor(() =>
      expect(canvas.queryByText(FIRST_THREAD_TITLE)).not.toBeInTheDocument(),
    );
    await expect(
      canvas.queryByRole('button', { name: 'Chat details' }),
    ).not.toBeInTheDocument();

    await user.click(
      canvas.getByRole('button', { name: 'Back through history' }),
    );
    await canvas.findByRole('button', { name: 'Chat details' });
    await expect(canvas.getByText(FIRST_THREAD_TITLE)).toBeVisible();
    await expect(canvas.getAllByText(SECOND_THREAD_TITLE)).toHaveLength(1);

    await user.click(
      canvas.getByRole('button', { name: 'Forward through history' }),
    );
    await expect(
      canvas.queryByRole('button', { name: 'Chat details' }),
    ).not.toBeInTheDocument();
    await waitFor(() =>
      expect(canvas.queryByText(FIRST_THREAD_TITLE)).not.toBeInTheDocument(),
    );
    await expect(canvas.getByText(SECOND_THREAD_TITLE)).toBeVisible();
  },
};

export const TriageAfterReopeningConversation: Story = {
  beforeEach: () => {
    jotaiStore.set(
      aiChatInboxLayoutState.atom,
      AI_CHAT_INBOX_LAYOUT.SPLIT_VIEW,
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const user = userEvent.setup();

    await canvas.findByText(FIRST_THREAD_TITLE);
    loadChatRecordMetadata();
    await user.click(
      within(
        getThreadRow({ canvasElement, title: FIRST_THREAD_TITLE }),
      ).getByText(FIRST_THREAD_TITLE),
    );
    await canvas.findByRole('button', { name: 'Chat details' });
    await user.click(canvas.getByRole('button', { name: 'Close' }));
    await user.click(
      within(
        getThreadRow({ canvasElement, title: SECOND_THREAD_TITLE }),
      ).getByText(SECOND_THREAD_TITLE),
    );
    await canvas.findByRole('button', { name: 'Chat details' });
    archiveThread(SECOND_THREAD_ID);

    await waitFor(() => {
      expect(canvas.queryAllByText(SECOND_THREAD_TITLE)).toHaveLength(0);
      expect(canvas.getAllByText(FIRST_THREAD_TITLE)).toHaveLength(2);
    });
    await expect(
      canvas.getByRole('button', { name: 'Chat details' }),
    ).toBeVisible();
  },
};
