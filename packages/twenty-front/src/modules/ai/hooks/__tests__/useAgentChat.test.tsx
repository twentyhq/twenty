import { type MockedResponse } from '@apollo/client/testing';
import { useApolloClient } from '@apollo/client/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import {
  AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR,
  AGENT_CHAT_ASSISTANT_NAME,
  AgentChatThreadConversationType,
} from 'twenty-shared/ai';
import { StandardObjectNameSingular } from 'twenty-shared/types';

import { serializeJsonContentAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializeJsonContentAsAdvancedTextEditorDocument';
import { serializePlainTextAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument';
import { AGENT_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS } from '@/ai/constants/AgentChatNewThreadDefaultRecipients';
import { AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME } from '@/ai/constants/AgentChatRestoreEditorContentEventName';
import { useAgentChat } from '@/ai/hooks/useAgentChat';
import { agentChatDraftsByThreadIdState } from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatNewThreadChannelIdState } from '@/ai/states/agentChatNewThreadChannelIdState';
import { agentChatNewThreadRecipientsFamilyState } from '@/ai/states/agentChatNewThreadRecipientsFamilyState';
import { agentChatIsSendingMessageFamilyState } from '@/ai/states/agentChatIsSendingMessageFamilyState';
import { agentChatIsAwaitingFirstChunkFamilyState } from '@/ai/states/agentChatIsAwaitingFirstChunkFamilyState';
import { agentChatIsAssistantReplyPendingFamilySelector } from '@/ai/states/selectors/agentChatIsAssistantReplyPendingFamilySelector';
import { type AgentChatNewThreadRecipients } from '@/ai/types/AgentChatNewThreadRecipients';
import { agentChatSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
import { agentChatUploadedFilesState } from '@/ai/states/agentChatUploadedFilesState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { serializeMentionTagAsAdvancedTextEditorDocument } from '@/mention/utils/serializeMentionTagAsAdvancedTextEditorDocument';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  FeatureFlagKey,
  OpenDirectMessageDocument,
  PermissionFlagType,
  SendChatMessageDocument,
} from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import {
  mockCurrentWorkspace,
  mockedUserData,
  mockedWorkspaceMemberData,
} from '~/testing/mock-data/users';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const attachChatThreadToRecord = jest.fn();
const sentShouldAssistantReply = jest.fn();
const sentChannelId = jest.fn();
const sentMessageVariables = jest.fn();

jest.mock('@/ai/hooks/useAttachChatThreadToRecord', () => ({
  useAttachChatThreadToRecord: () => ({ attachChatThreadToRecord }),
}));

const loadAgentChatThread = jest.fn(async (threadId: string) => ({
  id: threadId,
}));

jest.mock('@/ai/hooks/useLoadAgentChatThread', () => ({
  useLoadAgentChatThread: () => ({ loadAgentChatThread }),
}));

const DRAFTS_STORAGE_KEY = 'ai/agentChatDraftsByThreadIdState';
const THREAD_ID = '20202020-0000-4000-8000-0000000000aa';
const DIRECT_MESSAGE_THREAD_ID = '20202020-0000-4000-8000-0000000000df';
const CHANNEL_ID = '20202020-0000-4000-8000-0000000000cc';
const RECIPIENT_ID = '20202020-0000-4000-8000-0000000000bb';
const FORMER_MEMBER_ID = '20202020-0000-4000-8000-0000000000ee';
const EXISTING_THREAD_ID = '20202020-0000-4000-8000-0000000000dd';
const COMPANY_TARGET = {
  objectNameSingular: 'company',
  recordId: '20202020-0000-4000-8000-000000000002',
};
const DRAFT_STARTED_FROM_COMPANY =
  serializeMentionTagAsAdvancedTextEditorDocument({
    ...COMPANY_TARGET,
    label: 'Acme',
    isConversationTarget: true,
  });
const DRAFT_MENTIONING_COMPANY =
  serializeMentionTagAsAdvancedTextEditorDocument({
    ...COMPANY_TARGET,
    label: 'Acme',
  });

type SendChatMessageOutcome = 'sent' | 'replying' | 'failed';

const buildSendChatMessageMock = (
  outcome: SendChatMessageOutcome,
): MockedResponse => ({
  request: {
    query: SendChatMessageDocument,
    variables: (variables) => {
      sentShouldAssistantReply(variables.shouldAssistantReply);
      sentChannelId(variables.channelId);
      sentMessageVariables(variables);

      return true;
    },
  },
  ...(outcome === 'failed'
    ? { error: new Error('Network error') }
    : {
        result: {
          data: {
            sendChatMessage: {
              messageId: 'message-id',
              queued: false,
              streamId: outcome === 'replying' ? 'stream-id' : null,
            },
          },
        },
      }),
});

const OPEN_DIRECT_MESSAGE_MOCK: MockedResponse = {
  request: {
    query: OpenDirectMessageDocument,
    variables: { workspaceMemberId: RECIPIENT_ID },
  },
  result: { data: { openDirectMessage: DIRECT_MESSAGE_THREAD_ID } },
};

const readPersistedDrafts = () =>
  JSON.parse(localStorage.getItem(DRAFTS_STORAGE_KEY) ?? '{}');

const renderAgentChat = ({
  persistedDrafts,
  sendChatMessageOutcomes,
  hasAiModels = true,
  isAiChatInboxEnabled = false,
  isDirectMessageIdentityEnabled = false,
  isDirectMessage = false,
  newThreadChannelId = null,
  newThreadRecipients = AGENT_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS,
  currentThreadId = null,
  objectMetadataItems,
}: {
  persistedDrafts: Record<string, string>;
  sendChatMessageOutcomes: SendChatMessageOutcome[];
  hasAiModels?: boolean;
  isAiChatInboxEnabled?: boolean;
  isDirectMessageIdentityEnabled?: boolean;
  isDirectMessage?: boolean;
  newThreadChannelId?: string | null;
  newThreadRecipients?: AgentChatNewThreadRecipients;
  currentThreadId?: string | null;
  objectMetadataItems?: EnrichedObjectMetadataItem[];
}) => {
  const MetadataAndApolloMocksWrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: [
      ...sendChatMessageOutcomes.map(buildSendChatMessageMock),
      OPEN_DIRECT_MESSAGE_MOCK,
    ],
    objectMetadataItems,
    onInitializeJotaiStore: (store) => {
      store.set(
        aiModelsState.atom,
        hasAiModels ? [{ modelId: 'model', label: 'Model' }] : [],
      );
      store.set(newAiChatThreadIdState.atom, THREAD_ID);
      store.set(currentUserWorkspaceState.atom, {
        ...mockedUserData.currentUserWorkspace,
        permissionFlags: [PermissionFlagType.AI],
      });
      store.set(currentAiChatThreadState.atom, currentThreadId);
      store.set(
        agentChatNewThreadRecipientsFamilyState.atomFamily(THREAD_ID),
        newThreadRecipients,
      );
      store.set(agentChatNewThreadChannelIdState.atom, newThreadChannelId);
      store.set(currentWorkspaceMembersState.atom, [
        { ...mockedWorkspaceMemberData, id: RECIPIENT_ID },
      ]);
      if (isDirectMessage) {
        store.set(currentAiChatThreadState.atom, DIRECT_MESSAGE_THREAD_ID);
        store.set(recordStoreFamilyState.atomFamily(DIRECT_MESSAGE_THREAD_ID), {
          id: DIRECT_MESSAGE_THREAD_ID,
          __typename: 'AgentChatThread',
          conversationType: AgentChatThreadConversationType.DIRECT_MESSAGE,
        });
      }
      store.set(currentWorkspaceState.atom, {
        ...mockCurrentWorkspace,
        featureFlags: [
          {
            key: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
            value: isAiChatInboxEnabled,
          },
          {
            key: FeatureFlagKey.IS_AGENT_CHAT_DIRECT_MESSAGE_IDENTITY_ENABLED,
            value: isDirectMessageIdentityEnabled,
          },
        ],
      });
    },
  });

  localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(persistedDrafts));

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MetadataAndApolloMocksWrapper>
      <I18nProvider i18n={i18n}>
        <MemoryRouter>{children}</MemoryRouter>
      </I18nProvider>
    </MetadataAndApolloMocksWrapper>
  );

  return renderHook(
    () => {
      useAtomStateValue(agentChatDraftsByThreadIdState);

      return {
        ...useAgentChat(),
        apolloClient: useApolloClient(),
        currentAiChatThread: useAtomStateValue(currentAiChatThreadState),
        newAiChatThreadId: useAtomStateValue(newAiChatThreadIdState),
      };
    },
    { wrapper: Wrapper },
  ).result;
};

const holdNextMutation = (apolloClient: ReturnType<typeof useApolloClient>) => {
  let releaseMutation = () => {};
  const mutationGate = new Promise<void>((resolve) => {
    releaseMutation = resolve;
  });
  const originalMutate = apolloClient.mutate.bind(apolloClient);

  jest.spyOn(apolloClient, 'mutate').mockImplementationOnce(async (options) => {
    await mutationGate;

    return originalMutate(options);
  });

  return releaseMutation;
};

const send = async (result: {
  current: Pick<ReturnType<typeof useAgentChat>, 'handleSendMessage'>;
}) => {
  await act(async () => {
    await result.current.handleSendMessage();
  });
};

describe('useAgentChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('files a chat started from a record under it once its message is sent', async () => {
    const result = renderAgentChat({
      persistedDrafts: {
        [THREAD_ID]: DRAFT_STARTED_FROM_COMPANY,
      },
      sendChatMessageOutcomes: ['sent'],
    });

    await send(result);

    expect(attachChatThreadToRecord).toHaveBeenCalledTimes(1);
    expect(attachChatThreadToRecord).toHaveBeenCalledWith({
      threadId: THREAD_ID,
      ...COMPANY_TARGET,
    });
    expect(readPersistedDrafts()).toEqual({ [THREAD_ID]: '' });
  });

  it('keeps the new chat and its first message id until that message is sent', async () => {
    const result = renderAgentChat({
      persistedDrafts: {
        [THREAD_ID]: serializePlainTextAsAdvancedTextEditorDocument('Hello'),
      },
      sendChatMessageOutcomes: ['failed', 'sent'],
    });

    await send(result);

    expect(result.current.currentAiChatThread).toBe(THREAD_ID);
    expect(result.current.newAiChatThreadId).toBe(THREAD_ID);

    await send(result);

    expect(result.current.currentAiChatThread).toBe(THREAD_ID);
    expect(result.current.newAiChatThreadId).not.toBe(THREAD_ID);
    expect(sentMessageVariables).toHaveBeenCalledTimes(2);
    expect(sentMessageVariables.mock.calls[1][0].messageId).toBe(
      sentMessageVariables.mock.calls[0][0].messageId,
    );
  });

  it('finishes sending while recipient verification is still pending', async () => {
    const result = renderAgentChat({
      persistedDrafts: {
        [THREAD_ID]: serializePlainTextAsAdvancedTextEditorDocument('Hello'),
      },
      sendChatMessageOutcomes: ['sent'],
      isAiChatInboxEnabled: true,
      newThreadRecipients: {
        isAssistantParticipant: false,
        recipientWorkspaceMemberIds: [RECIPIENT_ID],
      },
      objectMetadataItems: [
        getMockObjectMetadataItemOrThrow('company'),
        {
          ...getMockObjectMetadataItemOrThrow('note'),
          nameSingular: StandardObjectNameSingular.AgentChatThread,
          namePlural: 'agentChatThreads',
        },
      ],
    });

    const query = jest
      .spyOn(result.current.apolloClient, 'query')
      .mockReturnValueOnce(new Promise<never>(() => {}));

    await send(result);

    expect(query).toHaveBeenCalledTimes(1);
    expect(readPersistedDrafts()).toEqual({ [THREAD_ID]: '' });
    expect(result.current.newAiChatThreadId).not.toBe(THREAD_ID);
    expect(
      jotaiStore.get(
        agentChatIsSendingMessageFamilyState.atomFamily({
          threadId: THREAD_ID,
        }),
      ),
    ).toBe(false);
  });

  it('files the chat when the retry of a failed first send goes through', async () => {
    const result = renderAgentChat({
      persistedDrafts: {
        [THREAD_ID]: DRAFT_STARTED_FROM_COMPANY,
      },
      sendChatMessageOutcomes: ['failed', 'sent'],
    });

    await send(result);

    expect(attachChatThreadToRecord).not.toHaveBeenCalled();
    expect(readPersistedDrafts()[THREAD_ID]).toEqual(
      DRAFT_STARTED_FROM_COMPANY,
    );

    await send(result);

    expect(attachChatThreadToRecord).toHaveBeenCalledWith({
      threadId: THREAD_ID,
      ...COMPANY_TARGET,
    });
  });

  it('gives a first message edited after a failed send a new id', async () => {
    const result = renderAgentChat({
      persistedDrafts: {
        [THREAD_ID]: serializePlainTextAsAdvancedTextEditorDocument('Hello'),
      },
      sendChatMessageOutcomes: ['failed', 'sent'],
    });

    await send(result);

    act(() => {
      jotaiStore.set(agentChatDraftsByThreadIdState.atom, (drafts) => ({
        ...drafts,
        [THREAD_ID]:
          serializePlainTextAsAdvancedTextEditorDocument('Hello again'),
      }));
    });

    await send(result);

    expect(sentMessageVariables).toHaveBeenCalledTimes(2);
    expect(sentMessageVariables.mock.calls[1][0].messageId).not.toBe(
      sentMessageVariables.mock.calls[0][0].messageId,
    );
  });

  it('keeps the first message id when the draft is saved differently but sends the same text', async () => {
    const result = renderAgentChat({
      persistedDrafts: {
        [THREAD_ID]: serializePlainTextAsAdvancedTextEditorDocument('Hello'),
      },
      sendChatMessageOutcomes: ['failed', 'sent'],
    });

    await send(result);

    act(() => {
      jotaiStore.set(agentChatDraftsByThreadIdState.atom, (drafts) => ({
        ...drafts,
        [THREAD_ID]: serializeJsonContentAsAdvancedTextEditorDocument({
          type: 'doc',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] },
            { type: 'paragraph' },
          ],
        }),
      }));
    });

    await send(result);

    expect(sentMessageVariables).toHaveBeenCalledTimes(2);
    expect(sentMessageVariables.mock.calls[1][0].messageId).toBe(
      sentMessageVariables.mock.calls[0][0].messageId,
    );
  });

  it('does not file a chat under a record it only mentions', async () => {
    const result = renderAgentChat({
      persistedDrafts: {
        [THREAD_ID]: DRAFT_MENTIONING_COMPANY,
      },
      sendChatMessageOutcomes: ['sent'],
    });

    await send(result);

    expect(attachChatThreadToRecord).not.toHaveBeenCalled();
  });

  it('keeps the composer while attachments upload and clears it on send', async () => {
    const result = renderAgentChat({
      persistedDrafts: {
        [THREAD_ID]: serializePlainTextAsAdvancedTextEditorDocument('Hello'),
      },
      sendChatMessageOutcomes: ['sent'],
    });
    const restoreEditorContent = jest.fn();

    window.addEventListener(
      AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME,
      restoreEditorContent,
    );
    jotaiStore.set(agentChatSelectedFilesState.atom, [
      new File(['brief'], 'brief.pdf'),
    ]);

    await send(result);

    expect(restoreEditorContent).not.toHaveBeenCalled();

    jotaiStore.set(agentChatSelectedFilesState.atom, []);

    await send(result);

    expect(restoreEditorContent).toHaveBeenCalledWith(
      expect.objectContaining({ detail: { content: '' } }),
    );

    window.removeEventListener(
      AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME,
      restoreEditorContent,
    );
  });

  it('does not file a chat that mentions no record', async () => {
    const result = renderAgentChat({
      persistedDrafts: {
        [THREAD_ID]: serializePlainTextAsAdvancedTextEditorDocument('Hello'),
      },
      sendChatMessageOutcomes: ['sent'],
    });

    await send(result);

    expect(attachChatThreadToRecord).not.toHaveBeenCalled();
  });

  it('sends without asking for a reply in the inbox when no AI is configured', async () => {
    const result = renderAgentChat({
      persistedDrafts: {
        [THREAD_ID]: serializePlainTextAsAdvancedTextEditorDocument('Hello'),
      },
      sendChatMessageOutcomes: ['sent'],
      hasAiModels: false,
      isAiChatInboxEnabled: true,
    });

    await send(result);

    expect(sentShouldAssistantReply).toHaveBeenCalledTimes(1);
    expect(sentShouldAssistantReply).toHaveBeenCalledWith(false);
    expect(readPersistedDrafts()).toEqual({ [THREAD_ID]: '' });
  });

  it('requests an assistant reply for an Ada mention in a direct message', async () => {
    const result = renderAgentChat({
      persistedDrafts: {
        [DIRECT_MESSAGE_THREAD_ID]:
          serializeMentionTagAsAdvancedTextEditorDocument({
            recordId: AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR,
            objectNameSingular:
              AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR,
            label: AGENT_CHAT_ASSISTANT_NAME,
            shouldAddAsParticipant: false,
          }),
      },
      sendChatMessageOutcomes: ['sent'],
      isAiChatInboxEnabled: true,
      isDirectMessage: true,
    });

    await send(result);

    expect(sentMessageVariables).toHaveBeenCalledTimes(1);
    expect(sentMessageVariables).toHaveBeenCalledWith(
      expect.objectContaining({
        threadId: DIRECT_MESSAGE_THREAD_ID,
        isAssistantMentioned: true,
        shouldAssistantReply: true,
      }),
    );
    expect(attachChatThreadToRecord).not.toHaveBeenCalled();
  });

  it('does not send without AI outside the inbox', async () => {
    const result = renderAgentChat({
      persistedDrafts: {
        [THREAD_ID]: serializePlainTextAsAdvancedTextEditorDocument('Hello'),
      },
      sendChatMessageOutcomes: ['sent'],
      hasAiModels: false,
    });

    await send(result);

    expect(sentShouldAssistantReply).not.toHaveBeenCalled();
  });

  it('creates an inbox chat with Ada selected by default', async () => {
    const result = renderAgentChat({
      persistedDrafts: {
        [THREAD_ID]: serializePlainTextAsAdvancedTextEditorDocument('Hello'),
      },
      sendChatMessageOutcomes: ['sent'],
      isAiChatInboxEnabled: true,
    });

    await send(result);

    expect(sentMessageVariables).toHaveBeenCalledTimes(1);
    expect(sentMessageVariables).toHaveBeenCalledWith(
      expect.objectContaining({
        isAssistantParticipant: true,
        isAssistantMentioned: false,
        recipientWorkspaceMemberIds: [],
      }),
    );
  });

  it('sends only selected workspace members without mentioning them, then clears them', async () => {
    const result = renderAgentChat({
      persistedDrafts: {
        [THREAD_ID]: serializePlainTextAsAdvancedTextEditorDocument('Hello'),
      },
      sendChatMessageOutcomes: ['sent'],
      isAiChatInboxEnabled: true,
      newThreadRecipients: {
        isAssistantParticipant: false,
        recipientWorkspaceMemberIds: [RECIPIENT_ID, FORMER_MEMBER_ID],
      },
    });

    await send(result);

    expect(sentMessageVariables).toHaveBeenCalledTimes(1);
    expect(sentMessageVariables).toHaveBeenCalledWith(
      expect.objectContaining({
        isAssistantParticipant: false,
        isAssistantMentioned: false,
        recipientWorkspaceMemberIds: [RECIPIENT_ID],
        shouldAssistantReply: true,
      }),
    );
    expect(sentMessageVariables.mock.lastCall?.[0]).not.toHaveProperty(
      'mentionedWorkspaceMemberIds',
    );
    expect(
      jotaiStore.get(
        agentChatNewThreadRecipientsFamilyState.atomFamily(THREAD_ID),
      ),
    ).toEqual(AGENT_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS);
  });

  it('keeps the draft without sending when Ada is removed and no recipients remain', async () => {
    const draft = serializePlainTextAsAdvancedTextEditorDocument('Hello');
    const recipients = {
      isAssistantParticipant: false,
      recipientWorkspaceMemberIds: [],
    };
    const result = renderAgentChat({
      persistedDrafts: { [THREAD_ID]: draft },
      sendChatMessageOutcomes: [],
      isAiChatInboxEnabled: true,
      newThreadRecipients: recipients,
    });
    const mutate = jest.spyOn(result.current.apolloClient, 'mutate');

    await send(result);

    expect(mutate).not.toHaveBeenCalled();
    expect(readPersistedDrafts()).toEqual({ [THREAD_ID]: draft });
    expect(result.current.newAiChatThreadId).toBe(THREAD_ID);
    expect(
      jotaiStore.get(
        agentChatNewThreadRecipientsFamilyState.atomFamily(THREAD_ID),
      ),
    ).toEqual(recipients);
  });

  it('sends a new chat to one person in their direct message and keeps its draft', async () => {
    const directMessageDraft =
      serializePlainTextAsAdvancedTextEditorDocument('Unsent');
    const result = renderAgentChat({
      persistedDrafts: {
        [THREAD_ID]: serializePlainTextAsAdvancedTextEditorDocument('Hello'),
        [DIRECT_MESSAGE_THREAD_ID]: directMessageDraft,
      },
      sendChatMessageOutcomes: ['sent'],
      isAiChatInboxEnabled: true,
      isDirectMessageIdentityEnabled: true,
      newThreadRecipients: {
        isAssistantParticipant: false,
        recipientWorkspaceMemberIds: [RECIPIENT_ID],
      },
    });

    await send(result);

    expect(sentMessageVariables).toHaveBeenCalledTimes(1);
    expect(sentMessageVariables).toHaveBeenCalledWith(
      expect.objectContaining({
        threadId: DIRECT_MESSAGE_THREAD_ID,
        text: 'Hello',
        browsingContext: null,
      }),
    );
    expect(sentMessageVariables.mock.lastCall?.[0]).not.toHaveProperty(
      'recipientWorkspaceMemberIds',
    );
    expect(result.current.currentAiChatThread).toBe(DIRECT_MESSAGE_THREAD_ID);
    expect(readPersistedDrafts()).toEqual({
      [THREAD_ID]: '',
      [DIRECT_MESSAGE_THREAD_ID]: directMessageDraft,
    });
    expect(
      jotaiStore.get(
        agentChatNewThreadRecipientsFamilyState.atomFamily(THREAD_ID),
      ),
    ).toEqual(AGENT_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS);
  });

  it('keeps a new chat edited while its direct message opens', async () => {
    const laterEdit = serializePlainTextAsAdvancedTextEditorDocument('Later');
    const result = renderAgentChat({
      persistedDrafts: {
        [THREAD_ID]: serializePlainTextAsAdvancedTextEditorDocument('Hello'),
      },
      sendChatMessageOutcomes: ['sent'],
      isAiChatInboxEnabled: true,
      isDirectMessageIdentityEnabled: true,
      newThreadRecipients: {
        isAssistantParticipant: false,
        recipientWorkspaceMemberIds: [RECIPIENT_ID],
      },
    });
    const releaseOpenDirectMessage = holdNextMutation(
      result.current.apolloClient,
    );

    let pendingSend: Promise<void> | undefined;

    await act(async () => {
      pendingSend = result.current.handleSendMessage();
    });

    act(() => {
      jotaiStore.set(agentChatDraftsByThreadIdState.atom, (drafts) => ({
        ...drafts,
        [THREAD_ID]: laterEdit,
      }));
    });
    releaseOpenDirectMessage();

    await act(async () => {
      await pendingSend;
    });

    expect(sentMessageVariables).toHaveBeenCalledWith(
      expect.objectContaining({
        threadId: DIRECT_MESSAGE_THREAD_ID,
        text: 'Hello',
      }),
    );
    expect(readPersistedDrafts()[THREAD_ID]).toBe(laterEdit);
    expect(
      jotaiStore.get(
        agentChatNewThreadRecipientsFamilyState.atomFamily(THREAD_ID),
      ),
    ).toEqual({
      isAssistantParticipant: false,
      recipientWorkspaceMemberIds: [RECIPIENT_ID],
    });
  });

  it('stays on the chat opened while the direct message opens', async () => {
    const result = renderAgentChat({
      persistedDrafts: {
        [THREAD_ID]: serializePlainTextAsAdvancedTextEditorDocument('Hello'),
      },
      sendChatMessageOutcomes: ['failed'],
      isAiChatInboxEnabled: true,
      isDirectMessageIdentityEnabled: true,
      newThreadRecipients: {
        isAssistantParticipant: false,
        recipientWorkspaceMemberIds: [RECIPIENT_ID],
      },
    });
    const restoreEditorContent = jest.fn();
    const releaseOpenDirectMessage = holdNextMutation(
      result.current.apolloClient,
    );

    window.addEventListener(
      AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME,
      restoreEditorContent,
    );

    let pendingSend: Promise<void> | undefined;

    await act(async () => {
      pendingSend = result.current.handleSendMessage();
    });

    act(() => {
      jotaiStore.set(currentAiChatThreadState.atom, EXISTING_THREAD_ID);
    });
    releaseOpenDirectMessage();

    await act(async () => {
      await pendingSend;
    });

    window.removeEventListener(
      AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME,
      restoreEditorContent,
    );

    expect(sentMessageVariables).toHaveBeenCalledWith(
      expect.objectContaining({ threadId: DIRECT_MESSAGE_THREAD_ID }),
    );
    expect(result.current.currentAiChatThread).toBe(EXISTING_THREAD_ID);
    expect(restoreEditorContent).not.toHaveBeenCalled();
    expect(readPersistedDrafts()[DIRECT_MESSAGE_THREAD_ID]).toContain('Hello');
  });

  it('keeps a new chat to one person as a draft while it has attachments', async () => {
    const draft = serializePlainTextAsAdvancedTextEditorDocument('Hello');
    const result = renderAgentChat({
      persistedDrafts: { [THREAD_ID]: draft },
      sendChatMessageOutcomes: [],
      isAiChatInboxEnabled: true,
      isDirectMessageIdentityEnabled: true,
      newThreadRecipients: {
        isAssistantParticipant: false,
        recipientWorkspaceMemberIds: [RECIPIENT_ID],
      },
    });
    const mutate = jest.spyOn(result.current.apolloClient, 'mutate');

    jotaiStore.set(agentChatUploadedFilesState.atom, [
      {
        type: 'file',
        fileId: 'file-id',
        filename: 'brief.pdf',
        mediaType: 'application/pdf',
        url: 'https://example.com/brief.pdf',
      },
    ]);

    await send(result);

    jotaiStore.set(agentChatUploadedFilesState.atom, []);

    expect(mutate).not.toHaveBeenCalled();
    expect(readPersistedDrafts()).toEqual({ [THREAD_ID]: draft });
    expect(result.current.currentAiChatThread).toBeNull();
  });

  it('sends a typed Ada mention independently of recipient selection', async () => {
    const result = renderAgentChat({
      persistedDrafts: {
        [THREAD_ID]: serializeMentionTagAsAdvancedTextEditorDocument({
          objectNameSingular: AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR,
          recordId: AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR,
          label: 'Ada',
        }),
      },
      sendChatMessageOutcomes: ['sent'],
      isAiChatInboxEnabled: true,
      newThreadRecipients: {
        isAssistantParticipant: false,
        recipientWorkspaceMemberIds: [],
      },
    });

    await send(result);

    expect(sentMessageVariables).toHaveBeenCalledTimes(1);
    expect(sentMessageVariables).toHaveBeenCalledWith(
      expect.objectContaining({
        isAssistantParticipant: false,
        isAssistantMentioned: true,
      }),
    );
  });

  it('sends a participant mention when the recipient bar is empty', async () => {
    const result = renderAgentChat({
      persistedDrafts: {
        [THREAD_ID]: serializeMentionTagAsAdvancedTextEditorDocument({
          objectNameSingular: StandardObjectNameSingular.WorkspaceMember,
          recordId: RECIPIENT_ID,
          label: 'Jane',
          shouldAddAsParticipant: true,
        }),
      },
      sendChatMessageOutcomes: ['sent'],
      isAiChatInboxEnabled: true,
      newThreadRecipients: {
        isAssistantParticipant: false,
        recipientWorkspaceMemberIds: [],
      },
    });

    await send(result);

    expect(sentMessageVariables).toHaveBeenCalledTimes(1);
    expect(sentMessageVariables).toHaveBeenCalledWith(
      expect.objectContaining({
        isAssistantParticipant: false,
        isAssistantMentioned: false,
        mentionedWorkspaceMemberIds: [RECIPIENT_ID],
      }),
    );
  });

  it('preserves recipients after failure and uses later edits on retry', async () => {
    const recipients = {
      isAssistantParticipant: false,
      recipientWorkspaceMemberIds: [RECIPIENT_ID],
    };
    const result = renderAgentChat({
      persistedDrafts: {
        [THREAD_ID]: serializePlainTextAsAdvancedTextEditorDocument('Hello'),
      },
      sendChatMessageOutcomes: ['failed', 'sent'],
      isAiChatInboxEnabled: true,
      newThreadRecipients: recipients,
    });

    await send(result);

    expect(result.current.newAiChatThreadId).toBe(THREAD_ID);
    expect(
      jotaiStore.get(
        agentChatNewThreadRecipientsFamilyState.atomFamily(THREAD_ID),
      ),
    ).toEqual(recipients);
    expect(readPersistedDrafts()[THREAD_ID]).toContain('Hello');

    jotaiStore.set(
      agentChatNewThreadRecipientsFamilyState.atomFamily(THREAD_ID),
      {
        isAssistantParticipant: true,
        recipientWorkspaceMemberIds: [],
      },
    );

    await send(result);

    expect(sentMessageVariables).toHaveBeenLastCalledWith(
      expect.objectContaining({
        isAssistantParticipant: true,
        recipientWorkspaceMemberIds: [],
      }),
    );
  });

  it('keeps recipient editing locked until the send settles and unlocks a retry', async () => {
    const result = renderAgentChat({
      persistedDrafts: {
        [THREAD_ID]: serializePlainTextAsAdvancedTextEditorDocument('Hello'),
      },
      sendChatMessageOutcomes: ['failed', 'sent'],
      isAiChatInboxEnabled: true,
      newThreadRecipients: {
        isAssistantParticipant: false,
        recipientWorkspaceMemberIds: [RECIPIENT_ID],
      },
    });
    const releaseMutation = holdNextMutation(result.current.apolloClient);

    let pendingSend: Promise<void> | undefined;

    await act(async () => {
      pendingSend = result.current.handleSendMessage();
    });

    const isSendingMessageAtom =
      agentChatIsSendingMessageFamilyState.atomFamily({ threadId: THREAD_ID });

    expect(jotaiStore.get(isSendingMessageAtom)).toBe(true);
    jotaiStore.set(
      agentChatIsAwaitingFirstChunkFamilyState.atomFamily({
        threadId: THREAD_ID,
      }),
      false,
    );
    expect(jotaiStore.get(isSendingMessageAtom)).toBe(true);
    releaseMutation();

    await act(async () => {
      await pendingSend;
    });

    expect(jotaiStore.get(isSendingMessageAtom)).toBe(false);
    expect(readPersistedDrafts()[THREAD_ID]).toContain('Hello');

    await send(result);

    expect(jotaiStore.get(isSendingMessageAtom)).toBe(false);
    expect(sentMessageVariables).toHaveBeenLastCalledWith(
      expect.objectContaining({
        isAssistantParticipant: false,
        recipientWorkspaceMemberIds: [RECIPIENT_ID],
      }),
    );
  });

  it('does not overwrite an existing chat with new-chat recipients', async () => {
    const result = renderAgentChat({
      persistedDrafts: {
        [EXISTING_THREAD_ID]:
          serializePlainTextAsAdvancedTextEditorDocument('Hello'),
      },
      sendChatMessageOutcomes: ['sent'],
      isAiChatInboxEnabled: true,
      currentThreadId: EXISTING_THREAD_ID,
      newThreadRecipients: {
        isAssistantParticipant: false,
        recipientWorkspaceMemberIds: [RECIPIENT_ID],
      },
    });

    await send(result);

    expect(sentMessageVariables).toHaveBeenCalledTimes(1);
    expect(sentMessageVariables).toHaveBeenCalledWith(
      expect.objectContaining({
        threadId: EXISTING_THREAD_ID,
      }),
    );
    expect(sentMessageVariables.mock.lastCall?.[0]).not.toHaveProperty(
      'isAssistantParticipant',
    );
    expect(sentMessageVariables.mock.lastCall?.[0]).not.toHaveProperty(
      'recipientWorkspaceMemberIds',
    );
  });

  it('sends a follow-up in an existing chat while the previous send is pending', async () => {
    const result = renderAgentChat({
      persistedDrafts: {
        [EXISTING_THREAD_ID]:
          serializePlainTextAsAdvancedTextEditorDocument('Hello'),
      },
      sendChatMessageOutcomes: ['sent', 'sent'],
      currentThreadId: EXISTING_THREAD_ID,
    });
    const releaseFirstSend = holdNextMutation(result.current.apolloClient);

    let firstSend: Promise<void> | undefined;

    await act(async () => {
      firstSend = result.current.handleSendMessage();
    });
    act(() => {
      jotaiStore.set(agentChatDraftsByThreadIdState.atom, (drafts) => ({
        ...drafts,
        [EXISTING_THREAD_ID]:
          serializePlainTextAsAdvancedTextEditorDocument('Follow-up'),
      }));
    });

    await send(result);

    expect(sentMessageVariables).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'Follow-up' }),
    );

    releaseFirstSend();

    await act(async () => {
      await firstSend;
    });

    expect(sentMessageVariables).toHaveBeenCalledTimes(2);
  });

  it('files a new chat into the channel it was started in, then forgets that channel', async () => {
    const result = renderAgentChat({
      persistedDrafts: {
        [THREAD_ID]: serializePlainTextAsAdvancedTextEditorDocument('Hello'),
      },
      sendChatMessageOutcomes: ['sent'],
      isAiChatInboxEnabled: true,
      newThreadChannelId: CHANNEL_ID,
      newThreadRecipients: {
        isAssistantParticipant: false,
        recipientWorkspaceMemberIds: [],
      },
    });

    await send(result);

    expect(sentChannelId).toHaveBeenCalledTimes(1);
    expect(sentChannelId).toHaveBeenCalledWith(CHANNEL_ID);
    expect(jotaiStore.get(agentChatNewThreadChannelIdState.atom)).toBeNull();
    expect(readPersistedDrafts()).toEqual({ [THREAD_ID]: '' });
  });

  it.each([
    { outcome: 'sent' as const, isAssistantReplyPending: false },
    { outcome: 'replying' as const, isAssistantReplyPending: true },
  ])(
    'shows the assistant reply as pending only once the server starts one ($outcome)',
    async ({ outcome, isAssistantReplyPending }) => {
      const result = renderAgentChat({
        persistedDrafts: {
          [EXISTING_THREAD_ID]:
            serializePlainTextAsAdvancedTextEditorDocument('Hello'),
        },
        sendChatMessageOutcomes: [outcome],
        currentThreadId: EXISTING_THREAD_ID,
      });
      const releaseMutation = holdNextMutation(result.current.apolloClient);
      const isAssistantReplyPendingAtom =
        agentChatIsAssistantReplyPendingFamilySelector.selectorFamily(
          EXISTING_THREAD_ID,
        );

      let pendingSend: Promise<void> | undefined;

      await act(async () => {
        pendingSend = result.current.handleSendMessage();
      });

      expect(jotaiStore.get(isAssistantReplyPendingAtom)).toBe(false);

      releaseMutation();

      await act(async () => {
        await pendingSend;
      });

      expect(jotaiStore.get(isAssistantReplyPendingAtom)).toBe(
        isAssistantReplyPending,
      );
    },
  );
});
