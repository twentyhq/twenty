import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { graphql, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';
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
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { recordPermissionsFamilyState } from '@/object-record/record-sharing/states/recordPermissionsFamilyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { AiChatPage } from '~/pages/ai-chat/AiChatPage';
import { MemoryRouterAppNavigatorProvider } from '~/testing/components/MemoryRouterAppNavigatorProvider';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { RootDecorator } from '~/testing/decorators/RootDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';

const EXISTING_THREAD_ID = '20202020-0000-4000-8000-0000000000aa';
const NEXT_DRAFT_THREAD_ID = '20202020-0000-4000-8000-0000000000bb';
const DRAFT_TEXT = 'Draft for the new conversation';
const CONTINUED_DRAFT_TEXT = ' with more details';

const NewChatRouteDecorator: Decorator = (Story) => (
  <MemoryRouter
    initialEntries={[
      getAppPath(AppPath.AiChat, {
        threadId: AI_CHAT_NEW_THREAD_PATH_SEGMENT,
      }),
    ]}
  >
    <MemoryRouterAppNavigatorProvider>
      <Routes>
        <Route path={AppPath.AiChat} element={<Story />} />
      </Routes>
    </MemoryRouterAppNavigatorProvider>
  </MemoryRouter>
);

const allowSelectedConversationUpdates = () => {
  const workspace = jotaiStore.get(currentWorkspaceState.atom);
  const workspaceMember = jotaiStore.get(currentWorkspaceMemberState.atom);
  const threadId = jotaiStore.get(currentAiChatThreadState.atom);
  const objectMetadataItem = jotaiStore.get(
    objectMetadataItemFamilySelector.selectorFamily({
      objectName: CoreObjectNameSingular.AgentChatThread,
      objectNameType: 'singular',
    }),
  );

  if (
    !isDefined(workspace) ||
    !isDefined(workspaceMember) ||
    !isDefined(threadId) ||
    !isDefined(objectMetadataItem)
  ) {
    throw new Error('The conversation metadata must be loaded.');
  }

  jotaiStore.set(
    recordPermissionsFamilyState.atomFamily({
      objectMetadataId: objectMetadataItem.id,
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
    NewChatRouteDecorator,
  ],
  beforeEach: () => {
    initializeNewAiChatStory({ isInboxEnabled: false });
    const draftThreadId = jotaiStore.get(newAiChatThreadIdState.atom);

    jotaiStore.set(agentChatDraftsByThreadIdState.atom, {
      [draftThreadId]:
        serializePlainTextAsAdvancedTextEditorDocument(DRAFT_TEXT),
    });
    jotaiStore.set(currentAiChatThreadState.atom, EXISTING_THREAD_ID);
  },
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

    await userEvent.type(editor, `{End}${CONTINUED_DRAFT_TEXT}`);
    await expect(editor).toHaveTextContent(
      `${DRAFT_TEXT}${CONTINUED_DRAFT_TEXT}`,
    );
    await waitFor(() =>
      expect(jotaiStore.get(currentAiChatThreadState.atom)).toBe(draftThreadId),
    );
  },
};
