import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { type Editor as ReactEditor } from '@tiptap/react';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { serializeAdvancedTextEditorDocument } from '@/advanced-text-editor/utils/serializeAdvancedTextEditorDocument';
import { AiChatParticipantMentionBar } from '@/ai/components/AiChatParticipantMentionBar';
import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { MentionTag } from '@/mention/extensions/MentionTag';
import { getMentionTagContent } from '@/mention/utils/getMentionTagContent';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

jest.mock('@tiptap/react', () => ({
  mergeAttributes: jest.requireActual('@tiptap/react').mergeAttributes,
  ReactNodeViewRenderer: () => () => ({}),
}));

const GRACE_ID = '20202020-0000-4000-8000-000000000021';

const renderBar = (editor: Editor) => {
  const Wrapper = getJestMetadataAndApolloMocksWrapper({
    onInitializeJotaiStore: (store) => {
      store.set(currentAiChatThreadState.atom, AGENT_CHAT_NEW_THREAD_DRAFT_KEY);
    },
  });

  return render(
    <Wrapper>
      <I18nProvider i18n={i18n}>
        <AiChatParticipantMentionBar editor={editor as ReactEditor} />
      </I18nProvider>
    </Wrapper>,
  );
};

describe('AiChatParticipantMentionBar', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = new Editor({
      extensions: [Document, Paragraph, Text, MentionTag],
      onUpdate: ({ editor: updatedEditor }) => {
        jotaiStore.set(agentChatDraftsByThreadIdState.atom, {
          [AGENT_CHAT_NEW_THREAD_DRAFT_KEY]:
            serializeAdvancedTextEditorDocument(updatedEditor),
        });
      },
    });
  });

  afterEach(() => {
    editor.destroy();
  });

  it('announces a mentioned teammate and lets the sender keep them out', async () => {
    renderBar(editor);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    act(() => {
      editor.commands.insertContent(
        getMentionTagContent({
          recordId: GRACE_ID,
          objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
          label: 'Grace Hopper',
          imageUrl: '',
          shouldAddAsParticipant: true,
        }),
      );
    });

    expect(screen.getByRole('status')).toHaveTextContent(
      'Grace Hopper will be added as a participant and get access to this chat',
    );

    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(editor.getText()).toContain('Grace Hopper');
  });
});
