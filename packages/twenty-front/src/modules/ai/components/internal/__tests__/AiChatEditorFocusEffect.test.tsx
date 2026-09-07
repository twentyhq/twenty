import { render } from '@testing-library/react';
import { Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { AiChatEditorFocusEffect } from '@/ai/components/internal/AiChatEditorFocusEffect';
import { shouldFocusChatEditorState } from '@/ai/states/shouldFocusChatEditorState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

// Whether the caret lands is tiptap's business and jsdom does not carry it, so
// these assert what the effect owns: which editor gets to consume the request.
describe('AiChatEditorFocusEffect', () => {
  let editor: Editor;

  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(shouldFocusChatEditorState.atom, true);
    editor = new Editor({ extensions: [Document, Paragraph, Text] });
  });

  afterEach(() => {
    if (!editor.isDestroyed) {
      editor.destroy();
    }
  });

  it('should consume the request on a live editor', () => {
    render(<AiChatEditorFocusEffect editor={editor} />, { wrapper: Wrapper });

    expect(jotaiStore.get(shouldFocusChatEditorState.atom)).toBe(false);
  });

  it('should leave the request for the next editor when the current one is destroyed', () => {
    editor.destroy();

    // The crash this guards against: tiptap throws from the commands getter
    // once the view is gone, so a destroyed editor cannot simply be focused.
    expect(() => editor.commands).toThrow();

    expect(() =>
      render(<AiChatEditorFocusEffect editor={editor} />, { wrapper: Wrapper }),
    ).not.toThrow();

    expect(jotaiStore.get(shouldFocusChatEditorState.atom)).toBe(true);
  });

  it('should keep the request while no editor is mounted', () => {
    render(<AiChatEditorFocusEffect editor={null} />, { wrapper: Wrapper });

    expect(jotaiStore.get(shouldFocusChatEditorState.atom)).toBe(true);
  });
});
