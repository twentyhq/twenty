import { type MockedResponse } from '@apollo/client/testing';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AgentChatThreadConversationType } from 'twenty-shared/ai';

import { serializePlainTextAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument';
import { AgentChatMessagesFetchEffect } from '@/ai/components/AgentChatMessagesFetchEffect';
import { AgentChatStreamSubscriptionEffect } from '@/ai/components/AgentChatStreamSubscriptionEffect';
import { AGENT_CHAT_SEND_MESSAGE_EVENT_NAME } from '@/ai/constants/AgentChatSendMessageEventName';
import { agentChatDraftsByThreadIdState } from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatIsSendingMessageFamilyState } from '@/ai/states/agentChatIsSendingMessageFamilyState';
import { agentChatMessagesFamilyState } from '@/ai/states/agentChatMessagesFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  FeatureFlagKey,
  GetChatMessagesDocument,
  PermissionFlagType,
  SendChatMessageDocument,
} from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import {
  mockCurrentWorkspace,
  mockedUserData,
  mockedWorkspaceMemberData,
} from '~/testing/mock-data/users';

jest.mock('@/ai/hooks/useAttachChatThreadToRecord', () => ({
  useAttachChatThreadToRecord: () => ({ attachChatThreadToRecord: jest.fn() }),
}));

const THREAD_ID = '20202020-0000-4000-8000-0000000000df';
const NEW_CHAT_THREAD_ID = '20202020-0000-4000-8000-0000000000aa';
const EARLIER_MESSAGE_ID = '20202020-0000-4000-8000-0000000000e1';
const REFETCH_DELAY_IN_MS = 200;

const buildFetchedMessage = ({ id, text }: { id: string; text: string }) => ({
  __typename: 'AgentMessage',
  id,
  threadId: THREAD_ID,
  turnId: null,
  agentId: null,
  isBuiltInAssistant: false,
  senderApplicationId: null,
  senderWorkspaceMemberId: mockedWorkspaceMemberData.id,
  role: 'user',
  status: 'sent',
  createdAt: '2026-11-12T10:00:00.000Z',
  processedAt: null,
  parts: [
    {
      __typename: 'AgentMessagePart',
      id: `${id}-part`,
      messageId: id,
      orderIndex: 0,
      type: 'text',
      textContent: text,
      reasoningContent: null,
      toolName: null,
      toolCallId: null,
      toolInput: null,
      toolOutput: null,
      state: null,
      providerExecuted: null,
      errorMessage: null,
      sourceUrlSourceId: null,
      sourceUrlUrl: null,
      sourceUrlTitle: null,
      sourceDocumentSourceId: null,
      sourceDocumentMediaType: null,
      sourceDocumentTitle: null,
      sourceDocumentFilename: null,
      fileMediaType: null,
      fileFilename: null,
      fileUrl: null,
      fileId: null,
      providerMetadata: null,
      createdAt: '2026-11-12T10:00:00.000Z',
    },
  ],
  reactions: [],
});

const buildChatMessagesResult = (
  messages: ReturnType<typeof buildFetchedMessage>[],
) => ({
  data: {
    chatMessages: messages,
    chatStreamCatchupChunks: null,
  },
});

const readDisplayedMessageTexts = () =>
  jotaiStore
    .get(agentChatMessagesFamilyState.atomFamily({ threadId: THREAD_ID }))
    .map((message) =>
      message.parts.map((part) => ('text' in part ? part.text : '')).join(''),
    );

const renderDirectMessageThread = () => {
  let sentMessageId: string | undefined;
  const earlierMessage = buildFetchedMessage({
    id: EARLIER_MESSAGE_ID,
    text: 'Earlier',
  });
  const apolloMocks: MockedResponse[] = [
    {
      request: {
        query: GetChatMessagesDocument,
        variables: { threadId: THREAD_ID },
      },
      result: buildChatMessagesResult([earlierMessage]),
    },
    {
      request: {
        query: SendChatMessageDocument,
        variables: (variables) => {
          sentMessageId = variables.messageId;

          return true;
        },
      },
      result: {
        data: {
          sendChatMessage: {
            messageId: 'message-id',
            queued: false,
            streamId: null,
            mentionedParticipantWorkspaceMemberIds: [],
            recipientParticipantWorkspaceMemberIds: [],
          },
        },
      },
    },
    {
      request: {
        query: GetChatMessagesDocument,
        variables: { threadId: THREAD_ID },
      },
      delay: REFETCH_DELAY_IN_MS,
      result: () =>
        buildChatMessagesResult([
          earlierMessage,
          buildFetchedMessage({ id: sentMessageId ?? '', text: 'Hello' }),
        ]),
    },
  ];

  const MetadataAndApolloMocksWrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks,
    onInitializeJotaiStore: (store) => {
      store.set(aiModelsState.atom, [{ modelId: 'model', label: 'Model' }]);
      store.set(newAiChatThreadIdState.atom, NEW_CHAT_THREAD_ID);
      store.set(currentAiChatThreadState.atom, THREAD_ID);
      store.set(agentChatDraftsByThreadIdState.atom, {
        [THREAD_ID]: serializePlainTextAsAdvancedTextEditorDocument('Hello'),
      });
      store.set(currentWorkspaceMemberState.atom, mockedWorkspaceMemberData);
      store.set(currentUserWorkspaceState.atom, {
        ...mockedUserData.currentUserWorkspace,
        permissionFlags: [PermissionFlagType.AI],
      });
      store.set(recordStoreFamilyState.atomFamily(THREAD_ID), {
        id: THREAD_ID,
        __typename: 'AgentChatThread',
        conversationType: AgentChatThreadConversationType.DIRECT_MESSAGE,
      });
      store.set(currentWorkspaceState.atom, {
        ...mockCurrentWorkspace,
        featureFlags: [
          { key: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED, value: true },
        ],
      });
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MetadataAndApolloMocksWrapper>
      <I18nProvider i18n={i18n}>
        <MemoryRouter>{children}</MemoryRouter>
      </I18nProvider>
    </MetadataAndApolloMocksWrapper>
  );

  render(
    <>
      <AgentChatMessagesFetchEffect />
      <AgentChatStreamSubscriptionEffect />
    </>,
    { wrapper: Wrapper },
  );

  return { getSentMessageId: () => sentMessageId };
};

describe('AgentChatStreamSubscriptionEffect', () => {
  it('keeps a direct message on screen until the refetch brings its saved copy', async () => {
    const { getSentMessageId } = renderDirectMessageThread();

    await waitFor(() => {
      expect(readDisplayedMessageTexts()).toEqual(['Earlier']);
    });

    act(() => {
      dispatchBrowserEvent(AGENT_CHAT_SEND_MESSAGE_EVENT_NAME);
    });

    await waitFor(() => {
      expect(getSentMessageId()).toBeDefined();
    });

    await waitFor(() => {
      expect(
        jotaiStore.get(
          agentChatIsSendingMessageFamilyState.atomFamily({
            threadId: THREAD_ID,
          }),
        ),
      ).toBe(false);
    });

    expect(readDisplayedMessageTexts()).toEqual(['Earlier', 'Hello']);

    await waitFor(() => {
      expect(
        jotaiStore
          .get(agentChatMessagesFamilyState.atomFamily({ threadId: THREAD_ID }))
          .at(-1)?.metadata?.createdAt,
      ).toBe('2026-11-12T10:00:00.000Z');
    });

    const displayedMessages = jotaiStore.get(
      agentChatMessagesFamilyState.atomFamily({ threadId: THREAD_ID }),
    );

    expect(displayedMessages.map(({ id }) => id)).toEqual([
      EARLIER_MESSAGE_ID,
      getSentMessageId(),
    ]);
  });
});
