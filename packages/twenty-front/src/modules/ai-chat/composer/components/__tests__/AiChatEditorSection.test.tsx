import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Editor } from '@tiptap/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { AiChatEditorSection } from '@/ai-chat/composer/components/AiChatEditorSection';
import { aiChatComposerAttachmentsFamilyState } from '@/ai-chat/composer/states/aiChatComposerAttachmentsFamilyState';
import { type AiChatFileUIPart } from '@/ai-chat/types/AiChatFileUIPart';
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

const PETS_CSV_ATTACHMENT: AiChatFileUIPart = {
  type: 'file',
  mediaType: 'text/csv',
  filename: 'Pets.csv',
  url: 'https://example.com/pets.csv',
  fileId: 'pets-file-id',
};

const renderEditorSection = ({
  threadId,
  attachments = [],
}: {
  threadId: string;
  attachments?: AiChatFileUIPart[];
}) => {
  const MetadataAndApolloWrapper = getJestMetadataAndApolloMocksWrapper({
    objectMetadataItems,
    onInitializeJotaiStore: (store) => {
      store.set(newAiChatThreadIdState.atom, NEW_CHAT_THREAD_ID);
      store.set(
        aiChatComposerAttachmentsFamilyState.atomFamily({ threadId }),
        attachments,
      );
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
    renderEditorSection({ threadId: NEW_CHAT_THREAD_ID });

    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('shows attachments above the message editor and removes them', async () => {
    renderEditorSection({
      threadId: NEW_CHAT_THREAD_ID,
      attachments: [PETS_CSV_ATTACHMENT],
    });

    const attachment = screen.getByRole('button', { name: 'Pets.csv' });

    expect(
      attachment.compareDocumentPosition(editor.view.dom) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    await userEvent.click(
      screen.getByRole('button', { name: 'Remove Pets.csv' }),
    );

    expect(
      screen.queryByRole('button', { name: 'Pets.csv' }),
    ).not.toBeInTheDocument();
  });

  it('waits for the permissions of an existing chat', () => {
    renderEditorSection({ threadId: '20202020-7c1e-4a0f-9d2b-3f4e5a6b7c8e' });

    expect(screen.getByRole('status')).toHaveTextContent(
      'Loading conversation…',
    );
  });
});
