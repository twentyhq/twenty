import { type MockedResponse } from '@apollo/client/testing';
import { useApolloClient } from '@apollo/client/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR } from 'twenty-shared/ai';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

import { serializePlainTextAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument';
import { AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME } from '@/ai/constants/AgentChatRestoreEditorContentEventName';
import { useAgentChat } from '@/ai/hooks/useAgentChat';
import { agentChatDraftsByThreadIdState } from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatNewThreadChannelIdState } from '@/ai/states/agentChatNewThreadChannelIdState';
import { agentChatNewThreadRecipientsFamilyState } from '@/ai/states/agentChatNewThreadRecipientsFamilyState';
import { agentChatIsSendingMessageFamilyState } from '@/ai/states/agentChatIsSendingMessageFamilyState';
import { agentChatIsAwaitingFirstChunkFamilyState } from '@/ai/states/agentChatIsAwaitingFirstChunkFamilyState';
import { type AgentChatNewThreadRecipients } from '@/ai/types/AgentChatNewThreadRecipients';
import { agentChatSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { serializeMentionTagAsAdvancedTextEditorDocument } from '@/mention/utils/serializeMentionTagAsAdvancedTextEditorDocument';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import {
  FeatureFlagKey,
  SendChatMessageDocument,
} from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const attachChatThreadToRecord = jest.fn();
const sentShouldAssistantReply = jest.fn();
const sentChannelId = jest.fn();
const sentMessageVariables = jest.fn();

jest.mock('@/ai/hooks/useAttachChatThreadToRecord', () => ({
  useAttachChatThreadToRecord: () => ({ attachChatThreadToRecord }),
}));

const DRAFTS_STORAGE_KEY = 'ai/agentChatDraftsByThreadIdState';
const THREAD_ID = '20202020-0000-4000-8000-0000000000aa';
const CHANNEL_ID = '20202020-0000-4000-8000-0000000000cc';
const RECIPIENT_ID = '20202020-0000-4000-8000-0000000000bb';
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

const buildSendChatMessageMock = (
  outcome: 'sent' | 'failed',
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
  ...(outcome === 'sent'
    ? {
        result: {
          data: {
            sendChatMessage: {
              messageId: 'message-id',
              queued: false,
              streamId: null,
            },
          },
        },
      }
    : { error: new Error('Network error') }),
});

const readPersistedDrafts = () =>
  JSON.parse(localStorage.getItem(DRAFTS_STORAGE_KEY) ?? '{}');

const renderAgentChat = ({
  persistedDrafts,
  sendChatMessageOutcomes,
  hasAiModels = true,
  isAiChatInboxEnabled = false,
  newThreadChannelId = null,
  newThreadRecipients = {
    isAssistantParticipant: true,
    recipientWorkspaceMemberIds: [],
  },
  currentThreadId = null,
}: {
  persistedDrafts: Record<string, string>;
  sendChatMessageOutcomes: ('sent' | 'failed')[];
  hasAiModels?: boolean;
  isAiChatInboxEnabled?: boolean;
  newThreadChannelId?: string | null;
  newThreadRecipients?: AgentChatNewThreadRecipients;
  currentThreadId?: string | null;
}) => {
  const MetadataAndApolloMocksWrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: sendChatMessageOutcomes.map(buildSendChatMessageMock),
    onInitializeJotaiStore: (store) => {
      store.set(
        aiModelsState.atom,
        hasAiModels ? [{ modelId: 'model', label: 'Model' }] : [],
      );
      store.set(newAiChatThreadIdState.atom, THREAD_ID);
      store.set(currentAiChatThreadState.atom, currentThreadId);
      store.set(
        agentChatNewThreadRecipientsFamilyState.atomFamily(THREAD_ID),
        newThreadRecipients,
      );
      store.set(agentChatNewThreadChannelIdState.atom, newThreadChannelId);
      store.set(currentWorkspaceState.atom, {
        ...mockCurrentWorkspace,
        featureFlags: [
          {
            key: FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
            value: isAiChatInboxEnabled,
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

  it('keeps the new chat until its first message is sent', async () => {
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

    expect(sentMessageVariables).toHaveBeenCalledWith(
      expect.objectContaining({
        isAssistantParticipant: true,
        isAssistantMentioned: false,
        recipientWorkspaceMemberIds: [],
      }),
    );
  });

  it('sends selected recipients without turning them into mentions', async () => {
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
    });

    await send(result);

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
        agentChatNewThreadRecipientsFamilyState.atomFamily(
          result.current.newAiChatThreadId,
        ),
      ),
    ).toEqual({
      isAssistantParticipant: true,
      recipientWorkspaceMemberIds: [],
    });
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

    expect(sentMessageVariables).toHaveBeenCalledWith(
      expect.objectContaining({
        isAssistantParticipant: false,
        isAssistantMentioned: true,
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
    let releaseMutation: (() => void) | undefined;
    const mutationGate = new Promise<void>((resolve) => {
      releaseMutation = resolve;
    });
    const originalMutate = result.current.apolloClient.mutate.bind(
      result.current.apolloClient,
    );

    jest
      .spyOn(result.current.apolloClient, 'mutate')
      .mockImplementationOnce(async (options) => {
        await mutationGate;

        return originalMutate(options);
      });

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
    assertIsDefinedOrThrow(releaseMutation);
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

  it('files a new chat into the channel it was started in, then forgets that channel', async () => {
    const result = renderAgentChat({
      persistedDrafts: {
        [THREAD_ID]: serializePlainTextAsAdvancedTextEditorDocument('Hello'),
      },
      sendChatMessageOutcomes: ['sent'],
      newThreadChannelId: CHANNEL_ID,
    });

    await send(result);

    expect(sentChannelId).toHaveBeenCalledWith(CHANNEL_ID);
    expect(jotaiStore.get(agentChatNewThreadChannelIdState.atom)).toBeNull();
    expect(readPersistedDrafts()).toEqual({ [THREAD_ID]: '' });
  });
});
