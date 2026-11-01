import { type MockedResponse } from '@apollo/client/testing';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { serializePlainTextAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument';
import { AGENT_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME } from '@/ai/constants/AgentChatRestoreEditorContentEventName';
import { useAgentChat } from '@/ai/hooks/useAgentChat';
import { agentChatDraftsByThreadIdState } from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatNewThreadChannelIdState } from '@/ai/states/agentChatNewThreadChannelIdState';
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

jest.mock('@/ai/hooks/useAttachChatThreadToRecord', () => ({
  useAttachChatThreadToRecord: () => ({ attachChatThreadToRecord }),
}));

const DRAFTS_STORAGE_KEY = 'ai/agentChatDraftsByThreadIdState';
const THREAD_ID = '20202020-0000-4000-8000-0000000000aa';
const CHANNEL_ID = '20202020-0000-4000-8000-0000000000cc';
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
}: {
  persistedDrafts: Record<string, string>;
  sendChatMessageOutcomes: ('sent' | 'failed')[];
  hasAiModels?: boolean;
  isAiChatInboxEnabled?: boolean;
  newThreadChannelId?: string | null;
}) => {
  const MetadataAndApolloMocksWrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: sendChatMessageOutcomes.map(buildSendChatMessageMock),
    onInitializeJotaiStore: (store) => {
      store.set(
        aiModelsState.atom,
        hasAiModels ? [{ modelId: 'model', label: 'Model' }] : [],
      );
      store.set(newAiChatThreadIdState.atom, THREAD_ID);
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
