import { type MockedResponse } from '@apollo/client/testing';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { serializePlainTextAsAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializePlainTextAsAdvancedTextEditorDocument';
import { useAgentChat } from '@/ai/hooks/useAgentChat';
import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { serializeMentionTagAsAdvancedTextEditorDocument } from '@/mention/utils/serializeMentionTagAsAdvancedTextEditorDocument';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { SendChatMessageDocument } from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { isResourceCreditSubscriptionItem } from '@/workspace/utils/isResourceCreditSubscriptionItem';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

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

type SendChatMessageOutcome = 'sent' | 'sentIncluded' | 'failed';

const buildSendChatMessageMock = (
  outcome: SendChatMessageOutcome,
): MockedResponse => ({
  request: { query: SendChatMessageDocument, variables: () => true },
  ...(outcome === 'failed'
    ? { error: new Error('Network error') }
    : {
        result: {
          data: {
            sendChatMessage: {
              messageId: 'message-id',
              queued: false,
              streamId: null,
              isIncluded: outcome === 'sentIncluded',
              mentionedParticipantWorkspaceMemberIds: null,
            },
          },
        },
      }),
});

const workspaceWithCreditsCap = (hasReachedCurrentPeriodCap: boolean) => ({
  ...mockCurrentWorkspace,
  currentBillingSubscription: {
    ...mockCurrentWorkspace.currentBillingSubscription,
    billingSubscriptionItems:
      mockCurrentWorkspace.currentBillingSubscription.billingSubscriptionItems.map(
        (billingSubscriptionItem) => ({
          ...billingSubscriptionItem,
          hasReachedCurrentPeriodCap,
        }),
      ),
  },
});

const hasReachedCreditsCap = () =>
  jotaiStore
    .get(currentWorkspaceState.atom)
    ?.currentBillingSubscription?.billingSubscriptionItems?.find(
      isResourceCreditSubscriptionItem,
    )?.hasReachedCurrentPeriodCap === true;

const readPersistedDrafts = () =>
  JSON.parse(localStorage.getItem(DRAFTS_STORAGE_KEY) ?? '{}');

const renderAgentChat = ({
  persistedDrafts,
  sendChatMessageOutcomes,
  hasReachedCurrentPeriodCap = false,
}: {
  persistedDrafts: Record<string, string>;
  sendChatMessageOutcomes: SendChatMessageOutcome[];
  hasReachedCurrentPeriodCap?: boolean;
}) => {
  const ensureThreadIdForSend = jest.fn(() => Promise.resolve(THREAD_ID));
  const MetadataAndApolloMocksWrapper = getJestMetadataAndApolloMocksWrapper({
    apolloMocks: sendChatMessageOutcomes.map(buildSendChatMessageMock),
    onInitializeJotaiStore: (store) => {
      store.set(aiModelsState.atom, [{ modelId: 'model', label: 'Model' }]);
      store.set(
        currentWorkspaceState.atom,
        workspaceWithCreditsCap(hasReachedCurrentPeriodCap),
      );
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
  });

  it('files a chat started from a record under it once its message is sent', async () => {
    const result = renderAgentChat({
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
      [AGENT_CHAT_NEW_THREAD_DRAFT_KEY]: '',
    });
  });

  it('files the chat when the retry of a failed first send goes through', async () => {
    const result = renderAgentChat({
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

  it('does not file a chat under a record it only mentions', async () => {
    const result = renderAgentChat({
      persistedDrafts: {
        [AGENT_CHAT_NEW_THREAD_DRAFT_KEY]: DRAFT_MENTIONING_COMPANY,
      },
      sendChatMessageOutcomes: ['sent'],
    });

    await send(result);

    expect(attachChatThreadToRecord).not.toHaveBeenCalled();
  });

  it('does not file a chat that mentions no record', async () => {
    const result = renderAgentChat({
      persistedDrafts: {
        [AGENT_CHAT_NEW_THREAD_DRAFT_KEY]:
          serializePlainTextAsAdvancedTextEditorDocument('Hello'),
      },
      sendChatMessageOutcomes: ['sent'],
    });

    await send(result);

    expect(attachChatThreadToRecord).not.toHaveBeenCalled();
  });

  it('takes a billed send as proof the workspace has credits again', async () => {
    const result = renderAgentChat({
      persistedDrafts: {
        [AGENT_CHAT_NEW_THREAD_DRAFT_KEY]:
          serializePlainTextAsAdvancedTextEditorDocument('Hello'),
      },
      sendChatMessageOutcomes: ['sent'],
      hasReachedCurrentPeriodCap: true,
    });

    await send(result);

    expect(readPersistedDrafts()[THREAD_ID]).toBeUndefined();
    expect(hasReachedCreditsCap()).toBe(false);
  });

  it('keeps the workspace out of credits after a send on the included model', async () => {
    const result = renderAgentChat({
      persistedDrafts: {
        [AGENT_CHAT_NEW_THREAD_DRAFT_KEY]:
          serializePlainTextAsAdvancedTextEditorDocument('Hello'),
      },
      sendChatMessageOutcomes: ['sentIncluded'],
      hasReachedCurrentPeriodCap: true,
    });

    await send(result);

    expect(readPersistedDrafts()[THREAD_ID]).toBeUndefined();
    expect(hasReachedCreditsCap()).toBe(true);
  });
});
