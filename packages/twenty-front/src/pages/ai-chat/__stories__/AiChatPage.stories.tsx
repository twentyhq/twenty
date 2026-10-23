import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router-dom';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { ComponentDecorator } from 'twenty-ui/testing';

import { serializePlainTextAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument';
import { AI_CHAT_NEW_THREAD_PATH_SEGMENT } from '@/ai/constants/AiChatNewThreadPathSegment';
import { agentChatDraftsByThreadIdState } from '@/ai/states/agentChatDraftsByThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { initializeNewAiChatStory } from '@/ai/testing/initializeNewAiChatStory';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { flatObjectMetadataItemsSelector } from '@/object-metadata/states/flatObjectMetadataItemsSelector';
import { recordPermissionsFamilyState } from '@/object-record/record-sharing/states/recordPermissionsFamilyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { AiChatPage } from '~/pages/ai-chat/AiChatPage';
import { MemoryRouterAppNavigatorProvider } from '~/testing/components/MemoryRouterAppNavigatorProvider';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const EXISTING_THREAD_ID = '20202020-0000-4000-8000-0000000000aa';
const NEXT_DRAFT_THREAD_ID = '20202020-0000-4000-8000-0000000000bb';
const RETURNED_DRAFT_THREAD_ID = '20202020-0000-4000-8000-0000000000dd';
const CHAT_OBJECT_METADATA_ID = '20202020-0000-4000-8000-0000000000cc';
const DRAFT_TEXT = 'Draft for the new conversation';
const NEXT_DRAFT_TEXT = 'Draft selected when opening the new chat route';
const RETURNED_DRAFT_TEXT = 'Draft selected when returning through history';
const CONTINUED_DRAFT_TEXT = ' with more details';
const OTHER_PAGE_PATH = '/new-chat-story-other-page';

const ChatRouteNavigation = () => {
  const navigate = useNavigate();

  return (
    <>
      <Button
        onClick={() =>
          navigate(
            getAppPath(AppPath.AiChat, {
              threadId: AI_CHAT_NEW_THREAD_PATH_SEGMENT,
            }),
          )
        }
      >
        Open new chat
      </Button>
      <Button onClick={() => navigate(OTHER_PAGE_PATH)}>Leave chat</Button>
      <Button onClick={() => navigate(-1)}>Back through history</Button>
      <Button onClick={() => navigate(1)}>Forward through history</Button>
    </>
  );
};

const createChatRouteDecorator =
  ({
    initialPath,
    shouldShowNavigation = false,
  }: {
    initialPath: string;
    shouldShowNavigation?: boolean;
  }): Decorator =>
  (Story) => (
    <MemoryRouter initialEntries={[initialPath]}>
      <MemoryRouterAppNavigatorProvider>
        {shouldShowNavigation && <ChatRouteNavigation />}
        <Routes>
          <Route path={AppPath.AiChat} element={<Story />} />
          <Route path={OTHER_PAGE_PATH} element={<div>Outside chat</div>} />
        </Routes>
      </MemoryRouterAppNavigatorProvider>
    </MemoryRouter>
  );

const initializeChatPageStory = () => {
  initializeNewAiChatStory({ isInboxEnabled: false });
  const draftThreadId = jotaiStore.get(newAiChatThreadIdState.atom);

  jotaiStore.set(agentChatDraftsByThreadIdState.atom, {
    [draftThreadId]: serializePlainTextAsAdvancedTextEditorDocument(DRAFT_TEXT),
  });
  jotaiStore.set(currentAiChatThreadState.atom, EXISTING_THREAD_ID);
};

const allowSelectedConversationUpdates = () => {
  const workspace = jotaiStore.get(currentWorkspaceState.atom);
  const workspaceMember = jotaiStore.get(currentWorkspaceMemberState.atom);
  const threadId = jotaiStore.get(currentAiChatThreadState.atom);
  const objectMetadataTemplate = jotaiStore
    .get(flatObjectMetadataItemsSelector.atom)
    .find(({ nameSingular }) => nameSingular === CoreObjectNameSingular.Note);

  if (
    !isDefined(workspace) ||
    !isDefined(workspaceMember) ||
    !isDefined(threadId) ||
    !isDefined(objectMetadataTemplate)
  ) {
    throw new Error('The conversation metadata must be loaded.');
  }

  const chatObjectMetadataItem = {
    ...objectMetadataTemplate,
    id: CHAT_OBJECT_METADATA_ID,
    universalIdentifier: CHAT_OBJECT_METADATA_ID,
    nameSingular: CoreObjectNameSingular.AgentChatThread,
    namePlural: 'agentChatThreads',
    labelSingular: 'Chat',
    labelPlural: 'Chats',
    labelIdentifierFieldMetadataId: '',
    isSystem: true,
    isSearchable: false,
    searchFieldMetadatas: [],
  };

  jotaiStore.set(
    metadataStoreState.atomFamily('objectMetadataItems'),
    (metadataStore) => ({
      ...metadataStore,
      current: [...metadataStore.current, chatObjectMetadataItem],
    }),
  );

  jotaiStore.set(
    recordPermissionsFamilyState.atomFamily({
      objectMetadataId: CHAT_OBJECT_METADATA_ID,
      recordId: threadId,
      workspaceId: workspace.id,
      workspaceMemberId: workspaceMember.id,
    }),
    {
      requestId: 'new-chat-story',
      permissions: {
        canRead: true,
        canUpdate: true,
        canDelete: true,
        canSoftDelete: true,
      },
      userWorkspace: jotaiStore.get(currentUserWorkspaceState.atom),
    },
  );
};

const meta = {
  title: 'Pages/AiChat/AiChatPage',
  component: AiChatPage,
  decorators: [
    ComponentDecorator,
    ObjectMetadataItemsDecorator,
    RootDecorator,
    ToastDecorator,
  ],
  beforeEach: initializeChatPageStory,
  parameters: {
    container: { width: 1000, height: 784 },
    msw: {
      handlers: [
        graphql.query('GetAiChatUsage', () =>
          HttpResponse.json({ data: { aiChatUsage: null } }),
        ),
      ],
    },
  },
} satisfies Meta<typeof AiChatPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NewChatDraftSelection: Story = {
  decorators: [
    createChatRouteDecorator({
      initialPath: getAppPath(AppPath.AiChat, {
        threadId: AI_CHAT_NEW_THREAD_PATH_SEGMENT,
      }),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const editor = await canvas.findByRole('textbox');
    const draftThreadId = jotaiStore.get(newAiChatThreadIdState.atom);

    await expect(editor).toHaveTextContent(DRAFT_TEXT);
    await expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(
      draftThreadId,
    );

    allowSelectedConversationUpdates();
    jotaiStore.set(newAiChatThreadIdState.atom, NEXT_DRAFT_THREAD_ID);

    await userEvent.click(editor);
    const selection = editor.ownerDocument.getSelection();
    selection?.selectAllChildren(editor);
    selection?.collapseToEnd();

    await userEvent.type(editor, CONTINUED_DRAFT_TEXT, { skipClick: true });
    await expect(editor).toHaveTextContent(
      `${DRAFT_TEXT}${CONTINUED_DRAFT_TEXT}`,
    );
    await waitFor(() =>
      expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(draftThreadId),
    );
  },
};

export const NewChatRouteHistory: Story = {
  decorators: [
    createChatRouteDecorator({
      initialPath: getAppPath(AppPath.AiChat, { threadId: null }),
      shouldShowNavigation: true,
    }),
  ],
  beforeEach: () => {
    initializeChatPageStory();
    jotaiStore.set(currentAiChatThreadState.atom, null);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('textbox')).toHaveTextContent(
      DRAFT_TEXT,
    );

    jotaiStore.set(agentChatDraftsByThreadIdState.atom, (drafts) => ({
      ...drafts,
      [NEXT_DRAFT_THREAD_ID]:
        serializePlainTextAsAdvancedTextEditorDocument(NEXT_DRAFT_TEXT),
    }));
    jotaiStore.set(newAiChatThreadIdState.atom, NEXT_DRAFT_THREAD_ID);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Open new chat' }),
    );
    await expect(await canvas.findByRole('textbox')).toHaveTextContent(
      NEXT_DRAFT_TEXT,
    );
    await expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(
      NEXT_DRAFT_THREAD_ID,
    );

    await userEvent.click(canvas.getByRole('button', { name: 'Leave chat' }));
    await expect(await canvas.findByText('Outside chat')).toBeVisible();

    jotaiStore.set(agentChatDraftsByThreadIdState.atom, (drafts) => ({
      ...drafts,
      [RETURNED_DRAFT_THREAD_ID]:
        serializePlainTextAsAdvancedTextEditorDocument(RETURNED_DRAFT_TEXT),
    }));
    jotaiStore.set(newAiChatThreadIdState.atom, RETURNED_DRAFT_THREAD_ID);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Back through history' }),
    );
    await expect(await canvas.findByRole('textbox')).toHaveTextContent(
      RETURNED_DRAFT_TEXT,
    );
    await expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(
      RETURNED_DRAFT_THREAD_ID,
    );

    await userEvent.click(
      canvas.getByRole('button', { name: 'Forward through history' }),
    );
    await expect(await canvas.findByText('Outside chat')).toBeVisible();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Back through history' }),
    );
    await expect(await canvas.findByRole('textbox')).toHaveTextContent(
      RETURNED_DRAFT_TEXT,
    );
  },
};
