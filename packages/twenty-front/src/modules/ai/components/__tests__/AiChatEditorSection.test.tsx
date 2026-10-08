import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Editor } from '@tiptap/react';
import { type ReactNode } from 'react';

import { AiChatEditorSection } from '@/ai/components/AiChatEditorSection';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const NEW_CHAT_THREAD_ID = '20202020-7c1e-4a0f-9d2b-3f4e5a6b7c8d';

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

const renderEditorSection = (currentAiChatThread: string) => {
  const MetadataAndApolloWrapper = getJestMetadataAndApolloMocksWrapper({
    objectMetadataItems,
    onInitializeJotaiStore: (store) => {
      store.set(newAiChatThreadIdState.atom, NEW_CHAT_THREAD_ID);
      store.set(currentAiChatThreadState.atom, currentAiChatThread);
      store.set(agentChatDisplayedThreadState.atom, currentAiChatThread);
    },
  });

  return render(
    <MetadataAndApolloWrapper>
      <I18nProvider i18n={i18n}>
        <AiChatEditorSection />
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

  it('shows the composer on a new chat, which has no thread to load permissions for', () => {
    renderEditorSection(NEW_CHAT_THREAD_ID);

    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('waits for the permissions of an existing chat', () => {
    renderEditorSection('20202020-7c1e-4a0f-9d2b-3f4e5a6b7c8e');

    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading conversation…',
    );
  });
});
