import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Editor } from '@tiptap/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { InboxEditorSection } from '@/ai/components/InboxEditorSection';
import { inboxDisplayedThreadState } from '@/ai/states/inboxDisplayedThreadState';
import { currentInboxThreadState } from '@/ai/states/currentInboxThreadState';
import { newInboxThreadIdState } from '@/ai/states/newInboxThreadIdState';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const NEW_CHAT_THREAD_ID = '20202020-7c1e-4a0f-9d2b-3f4e5a6b7c8d';

const useInboxEditor = jest.fn();
jest.mock('@/ai/hooks/useInboxEditor', () => ({
  useInboxEditor: () => useInboxEditor(),
}));
jest.mock('@/ai/hooks/useHasReachedAiChatUsageLimit', () => ({
  useHasReachedAiChatUsageLimit: () => false,
}));
jest.mock('@/ai/components/InboxStandaloneError', () => ({
  InboxStandaloneError: () => null,
}));
jest.mock('@/ai/components/AiChatPendingAskGate', () => ({
  AiChatPendingAskGate: ({ children }: { children: ReactNode }) => children,
}));

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

const renderEditorSection = (currentInboxThread: string) => {
  const MetadataAndApolloWrapper = getJestMetadataAndApolloMocksWrapper({
    objectMetadataItems,
    onInitializeJotaiStore: (store) => {
      store.set(newInboxThreadIdState.atom, NEW_CHAT_THREAD_ID);
      store.set(currentInboxThreadState.atom, currentInboxThread);
      store.set(inboxDisplayedThreadState.atom, currentInboxThread);
    },
  });

  return render(
    <MetadataAndApolloWrapper>
      <I18nProvider i18n={i18n}>
        <MemoryRouter>
          <InboxEditorSection />
        </MemoryRouter>
      </I18nProvider>
    </MetadataAndApolloWrapper>,
  );
};

describe('InboxEditorSection', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = new Editor({ extensions: [Document, Paragraph, Text] });
    useInboxEditor.mockReturnValue({ editor });
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
