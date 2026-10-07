import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Editor } from '@tiptap/react';
import { type ReactNode } from 'react';
import { type Store } from 'jotai/vanilla/store';

import { AiChatEditorSection } from '@/ai/components/AiChatEditorSection';
import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { threadIdCreatedFromDraftState } from '@/ai/states/threadIdCreatedFromDraftState';
import { setAiChatIncludedModelWorkspace } from '@/ai/testing/setAiChatIncludedModelWorkspace';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const CREATED_THREAD_ID = '20202020-7c1e-4a0f-9d2b-3f4e5a6b7c8d';

const useAiChatEditor = jest.fn();
jest.mock('@/ai/hooks/useAiChatEditor', () => ({
  useAiChatEditor: () => useAiChatEditor(),
}));
jest.mock('@/ai/hooks/useHasReachedAiChatUsageLimit', () => ({
  useHasReachedAiChatUsageLimit: () => false,
}));
jest.mock('@/ai/components/AiChatStandaloneError', () => ({
  AiChatStandaloneError: () => null,
}));
jest.mock('@/ai/components/AiChatPendingAskGate', () => ({
  AiChatPendingAskGate: ({ children }: { children: ReactNode }) => children,
}));
jest.mock('@/ai/components/AiChatNoMoreBillingCreditsBanner', () => ({
  AiChatNoMoreBillingCreditsBanner: () => (
    <div>You’ve reached your AI usage limit.</div>
  ),
}));

const setUpCreditsCapReached =
  ({ isEntitled }: { isEntitled: boolean }) =>
  (store: Store) =>
    setAiChatIncludedModelWorkspace(store, {
      isEntitled,
      hasReachedCreditsCap: true,
    });

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

const renderEditorSectionOnNewChat = (
  onInitializeJotaiStore?: (store: Store) => void,
) => {
  const MetadataAndApolloWrapper = getJestMetadataAndApolloMocksWrapper({
    objectMetadataItems,
    onInitializeJotaiStore: (store) => {
      store.set(currentAiChatThreadState.atom, AGENT_CHAT_NEW_THREAD_DRAFT_KEY);
      store.set(
        agentChatDisplayedThreadState.atom,
        AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
      );
      onInitializeJotaiStore?.(store);
    },
  });

  return render(
    <MetadataAndApolloWrapper>
      <I18nProvider i18n={i18n}>
        <AgentChatComponentInstanceContext.Provider
          value={{ instanceId: 'agentChatComponentInstance' }}
        >
          <AiChatEditorSection />
        </AgentChatComponentInstanceContext.Provider>
      </I18nProvider>
    </MetadataAndApolloWrapper>,
  );
};

describe('AiChatEditorSection', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = new Editor({ extensions: [Document, Paragraph, Text] });
    useAiChatEditor.mockReturnValue({ editor, handleSendAndClear: jest.fn() });
  });

  afterEach(() => {
    editor.destroy();
  });

  it('keeps the composer mounted when typing the first message creates the thread', () => {
    renderEditorSectionOnNewChat();
    const sendButton = screen.getByRole('button', { name: /send/i });

    act(() => {
      jotaiStore.set(threadIdCreatedFromDraftState.atom, CREATED_THREAD_ID);
      jotaiStore.set(currentAiChatThreadState.atom, CREATED_THREAD_ID);
      jotaiStore.set(agentChatDisplayedThreadState.atom, CREATED_THREAD_ID);
    });

    expect(sendButton).toBeInTheDocument();
  });

  it('hides the out of credits banner when the chat runs on the included model', () => {
    renderEditorSectionOnNewChat(setUpCreditsCapReached({ isEntitled: true }));

    expect(
      screen.queryByText('You’ve reached your AI usage limit.'),
    ).not.toBeInTheDocument();
  });

  it('keeps the out of credits banner without the included model entitlement', () => {
    renderEditorSectionOnNewChat(setUpCreditsCapReached({ isEntitled: false }));

    expect(
      screen.getByText('You’ve reached your AI usage limit.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Use GPT-5.6 Luna' }),
    ).not.toBeInTheDocument();
  });

  it('offers to switch a picked paid tier back to the included model once credits run out', async () => {
    renderEditorSectionOnNewChat((store) =>
      setAiChatIncludedModelWorkspace(store, {
        hasReachedCreditsCap: true,
        userSelectedTier: 'smart',
      }),
    );

    expect(
      screen.getByText('You’ve reached your AI usage limit.'),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Use GPT-5.6 Luna' }),
    );

    expect(
      screen.queryByText('You’ve reached your AI usage limit.'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Use GPT-5.6 Luna' }),
    ).not.toBeInTheDocument();
  });
});
