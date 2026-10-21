import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { expect, userEvent, within } from 'storybook/test';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';

import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { AI_CHAT_INBOX_LAYOUT } from '@/ai/constants/AiChatInboxLayout';
import { AI_CHAT_NEW_THREAD_PATH_SEGMENT } from '@/ai/constants/AiChatNewThreadPathSegment';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { aiChatInboxLayoutState } from '@/ai/states/aiChatInboxLayoutState';
import { initializeNewAiChatStory } from '@/ai/testing/initializeNewAiChatStory';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { AiChatInboxPage } from '~/pages/ai-chat/AiChatInboxPage';
import { MemoryRouterAppNavigatorProvider } from '~/testing/components/MemoryRouterAppNavigatorProvider';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const FIRST_THREAD_ID = '20202020-0000-4000-8000-0000000000aa';
const SECOND_THREAD_ID = '20202020-0000-4000-8000-0000000000bb';
const FIRST_THREAD_TITLE = 'Qualify the lead';
const SECOND_THREAD_TITLE = 'Prepare the customer call';
const THREAD_ACTIVITY_AT = '2026-10-21T09:00:00.000Z';
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

const InboxRouteNavigation = () => {
  const navigate = useNavigate();

  return (
    <>
      <Button onClick={() => navigate(NEW_CHAT_PATH)}>
        Open new chat route
      </Button>
      <Button onClick={() => navigate(NEW_CHAT_PATH, { replace: true })}>
        Replace new chat route
      </Button>
      <Button onClick={() => navigate(-1)}>Back through history</Button>
      <Button onClick={() => navigate(1)}>Forward through history</Button>
    </>
  );
};

const InboxRouteDecorator: Decorator = (Story) => (
  <MemoryRouter
    initialEntries={[getAppPath(AppPath.AiChatInbox, { threadId: null })]}
  >
    <MemoryRouterAppNavigatorProvider>
      <InboxRouteNavigation />
      <Routes>
        <Route path={AppPath.AiChatInbox} element={<Story />} />
      </Routes>
    </MemoryRouterAppNavigatorProvider>
  </MemoryRouter>
);

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

    const getThreadRow = (title: string) => {
      const row = canvas
        .getByText(title)
        .closest<HTMLDivElement>('[data-selectable-id]');

      if (!isDefined(row)) {
        throw new Error('The chat row must be visible.');
      }

      return row;
    };

    const selectThread = async (title: string) => {
      const row = getThreadRow(title);

      await user.keyboard('{Control>}');
      await user.click(within(row).getByText(title));
      await user.keyboard('{/Control}');
      await expect(
        within(row).getByRole('checkbox', { name: 'Select chat' }),
      ).toBeChecked();
    };

    const expectThreadUnchecked = async (title: string) => {
      const row = getThreadRow(title);

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
    const firstThreadRow = getThreadRow(FIRST_THREAD_TITLE);

    await selectThread(FIRST_THREAD_TITLE);
    await expect(canvas.getByText('1 chat selected')).toBeVisible();

    await user.click(
      canvas.getByRole('button', { name: 'Replace new chat route' }),
    );
    await expect(await canvas.findByRole('textbox')).toBeVisible();
    await expectThreadUnchecked(FIRST_THREAD_TITLE);
    await expect(getThreadRow(FIRST_THREAD_TITLE)).toBe(firstThreadRow);
  },
};
