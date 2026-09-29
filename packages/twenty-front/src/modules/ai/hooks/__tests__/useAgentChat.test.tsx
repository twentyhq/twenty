import { type MockedResponse } from '@apollo/client/testing';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { serializePlainTextAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument';
import { SEND_CHAT_MESSAGE } from '@/ai/graphql/mutations/sendChatMessage';
import { useAgentChat } from '@/ai/hooks/useAgentChat';
import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { type AgentChatDraft } from '@/ai/types/AgentChatDraft';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { serializeMentionTagAsAdvancedTextEditorDocument } from '@/mention/utils/serializeMentionTagAsAdvancedTextEditorDocument';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const attachChatThreadToRecord = jest.fn();

jest.mock('@/ai/hooks/useAttachChatThreadToRecord', () => ({
  useAttachChatThreadToRecord: () => ({ attachChatThreadToRecord }),
}));

const DRAFTS_STORAGE_KEY = 'ai/agentChatDraftsByThreadIdState';
const THREAD_ID = '20202020-0000-4000-8000-0000000000aa';
const COMPANY_TARGET = {
  objectNameSingular: 'company',
  recordId: '20202020-0000-4000-8000-000000000002',
};
const DRAFT_STARTED_FROM_COMPANY = {
  serializedDocument: serializeMentionTagAsAdvancedTextEditorDocument({
    ...COMPANY_TARGET,
    label: 'Acme',
  }),
  pendingRecordTarget: COMPANY_TARGET,
};

const buildSendChatMessageMock = (
  outcome: 'sent' | 'failed',
): MockedResponse => ({
  request: { query: SEND_CHAT_MESSAGE, variables: () => true },
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

// The composer subscribes to the drafts, which reads them back from local
// storage the way a reload of the app does.
const renderAgentChatAfterReload = ({
  persistedDrafts,
  sendChatMessageOutcomes,
  currentThreadId = null,
}: {
  persistedDrafts: Record<string, AgentChatDraft>;
  sendChatMessageOutcomes: ('sent' | 'failed')[];
  currentThreadId?: string | null;
}) => {
  const ensureThreadIdForSend = jest.fn(() => Promise.resolve(THREAD_ID));
  const MetadataAndApolloMocksWrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: sendChatMessageOutcomes.map(buildSendChatMessageMock),
    onInitializeJotaiStore: (store) => {
      store.set(aiModelsState.atom, [{ modelId: 'model', label: 'Model' }]);
      store.set(currentAiChatThreadState.atom, currentThreadId);
    },
  });

  // Set once the wrapper has reset the session's storage.
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

      return useAgentChat(ensureThreadIdForSend);
    },
    { wrapper: Wrapper },
  ).result;
};

const send = async (result: { current: ReturnType<typeof useAgentChat> }) => {
  await act(async () => {
    await result.current.handleSendMessage();
  });
};

describe('useAgentChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    attachChatThreadToRecord.mockResolvedValue(true);
  });

  it('files a chat started from a record under it on its first send, after a reload', async () => {
    const result = renderAgentChatAfterReload({
      persistedDrafts: {
        [AGENT_CHAT_NEW_THREAD_DRAFT_KEY]: DRAFT_STARTED_FROM_COMPANY,
      },
      sendChatMessageOutcomes: ['sent'],
    });

    await send(result);

    expect(attachChatThreadToRecord).toHaveBeenCalledTimes(1);
    expect(attachChatThreadToRecord).toHaveBeenCalledWith({
      threadId: THREAD_ID,
      ...COMPANY_TARGET,
    });
    expect(readPersistedDrafts()).toEqual({
      [AGENT_CHAT_NEW_THREAD_DRAFT_KEY]: { serializedDocument: '' },
    });
  });

  it('keeps the record with the draft when the first send fails, so the retry attaches it', async () => {
    const result = renderAgentChatAfterReload({
      persistedDrafts: {
        [AGENT_CHAT_NEW_THREAD_DRAFT_KEY]: DRAFT_STARTED_FROM_COMPANY,
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

  it('retries a failed attach on the next message sent in the thread', async () => {
    attachChatThreadToRecord.mockResolvedValueOnce(false);
    const result = renderAgentChatAfterReload({
      persistedDrafts: {
        [AGENT_CHAT_NEW_THREAD_DRAFT_KEY]: DRAFT_STARTED_FROM_COMPANY,
      },
      sendChatMessageOutcomes: ['sent'],
    });

    await send(result);

    expect(readPersistedDrafts()[THREAD_ID]).toEqual({
      serializedDocument: '',
      pendingRecordTarget: COMPANY_TARGET,
    });

    const resultAfterReload = renderAgentChatAfterReload({
      persistedDrafts: {
        ...readPersistedDrafts(),
        [THREAD_ID]: {
          serializedDocument:
            serializePlainTextAsAdvancedTextEditorDocument('And then?'),
          pendingRecordTarget: COMPANY_TARGET,
        },
      },
      sendChatMessageOutcomes: ['sent'],
      currentThreadId: THREAD_ID,
    });

    await send(resultAfterReload);

    expect(attachChatThreadToRecord).toHaveBeenCalledTimes(2);
    expect(readPersistedDrafts()[THREAD_ID]).toEqual({
      serializedDocument: '',
    });
  });

  it('leaves a chat that was not started from a record alone', async () => {
    const result = renderAgentChatAfterReload({
      persistedDrafts: {
        [AGENT_CHAT_NEW_THREAD_DRAFT_KEY]: {
          serializedDocument:
            serializePlainTextAsAdvancedTextEditorDocument('Hello'),
        },
      },
      sendChatMessageOutcomes: ['sent'],
    });

    await send(result);

    expect(readPersistedDrafts()).toEqual({
      [AGENT_CHAT_NEW_THREAD_DRAFT_KEY]: { serializedDocument: '' },
    });
    expect(attachChatThreadToRecord).not.toHaveBeenCalled();
  });
});
