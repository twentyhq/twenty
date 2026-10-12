import { type MockedResponse } from '@apollo/client/testing';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { serializePlainTextAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument';
import { useAgentChat } from '@/ai/hooks/useAgentChat';
import { agentChatDraftsByThreadIdState } from '@/ai/states/agentChatDraftsByThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { serializeMentionTagAsAdvancedTextEditorDocument } from '@/mention/utils/serializeMentionTagAsAdvancedTextEditorDocument';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SendChatMessageDocument } from '~/generated-metadata/graphql';
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
  request: { query: SendChatMessageDocument, variables: () => true },
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
}: {
  persistedDrafts: Record<string, string>;
  sendChatMessageOutcomes: ('sent' | 'failed')[];
}) => {
  const MetadataAndApolloMocksWrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: sendChatMessageOutcomes.map(buildSendChatMessageMock),
    onInitializeJotaiStore: (store) => {
      store.set(aiModelsState.atom, [{ modelId: 'model', label: 'Model' }]);
      store.set(newAiChatThreadIdState.atom, THREAD_ID);
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
});
