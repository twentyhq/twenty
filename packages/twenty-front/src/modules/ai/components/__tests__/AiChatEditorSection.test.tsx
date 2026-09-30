import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen } from '@testing-library/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Editor } from '@tiptap/react';
import { type ReactNode } from 'react';

import { AiChatEditorSection } from '@/ai/components/AiChatEditorSection';
import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { threadIdCreatedFromDraftState } from '@/ai/states/threadIdCreatedFromDraftState';
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

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

const renderEditorSectionOnNewChat = () => {
  const MetadataAndApolloWrapper = getJestMetadataAndApolloMocksWrapper({
    objectMetadataItems: [
      ...objectMetadataItems,
      {
        ...objectMetadataItems[0],
        id: '20202020-1b2c-4d3e-8f4a-5b6c7d8e9f0a',
        nameSingular: 'inputAsk',
        namePlural: 'inputAsks',
      },
    ],
    onInitializeJotaiStore: (store) => {
      store.set(currentAiChatThreadState.atom, AGENT_CHAT_NEW_THREAD_DRAFT_KEY);
      store.set(
        agentChatDisplayedThreadState.atom,
        AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
      );
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
});
