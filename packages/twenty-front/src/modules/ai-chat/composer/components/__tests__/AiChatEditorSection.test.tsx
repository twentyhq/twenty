import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Editor } from '@tiptap/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { AiChatEditorSection } from '@/ai-chat/composer/components/AiChatEditorSection';
import { AiChatTestInstance } from '@/ai-chat/testing/AiChatTestInstance';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const NEW_CHAT_THREAD_ID = '20202020-7c1e-4a0f-9d2b-3f4e5a6b7c8d';

const useAiChatEditor = jest.fn();
jest.mock('@/ai-chat/composer/hooks/useAiChatEditor', () => ({
  useAiChatEditor: () => useAiChatEditor(),
}));
jest.mock('@/ai-chat/composer/hooks/useSendAiChatComposerMessage', () => ({
  useSendAiChatComposerMessage: () => ({
    sendAiChatComposerMessage: jest.fn(),
  }),
}));
jest.mock('@/ai-chat/tool-calls/components/AiChatPendingAskGate', () => ({
  AiChatPendingAskGate: ({ children }: { children: ReactNode }) => children,
}));

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

const renderEditorSection = (threadId: string) => {
  const MetadataAndApolloWrapper = getJestMetadataAndApolloMocksWrapper({
    objectMetadataItems,
    onInitializeJotaiStore: (store) => {
      store.set(newAiChatThreadIdState.atom, NEW_CHAT_THREAD_ID);
    },
  });

  return render(
    <MetadataAndApolloWrapper>
      <I18nProvider i18n={i18n}>
        <AiChatTestInstance threadId={threadId}>
          <MemoryRouter>
            <AiChatEditorSection />
          </MemoryRouter>
        </AiChatTestInstance>
      </I18nProvider>
    </MetadataAndApolloWrapper>,
  );
};

describe('AiChatEditorSection', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = new Editor({ extensions: [Document, Paragraph, Text] });
    useAiChatEditor.mockReturnValue({ editor });
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
