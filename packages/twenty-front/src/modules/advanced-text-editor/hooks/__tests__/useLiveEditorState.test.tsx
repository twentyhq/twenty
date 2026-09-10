import { renderHook } from '@testing-library/react';
import { Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Heading } from '@tiptap/extension-heading';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';

import { useLiveEditorState } from '@/advanced-text-editor/hooks/useLiveEditorState';
import { hasEditorExtension } from '@/advanced-text-editor/utils/hasEditorExtension';

describe('useLiveEditorState', () => {
  it('should select from the editor that replaced a destroyed one', () => {
    const destroyedEditor = new Editor({
      extensions: [Document, Paragraph, Text],
    });
    const recreatedEditor = new Editor({
      extensions: [Document, Paragraph, Text, Heading],
    });

    const { result, rerender } = renderHook(
      ({ editor }) =>
        useLiveEditorState(editor, (currentEditor) =>
          hasEditorExtension(currentEditor, 'heading'),
        ),
      { initialProps: { editor: destroyedEditor } },
    );

    expect(result.current).toBe(false);

    destroyedEditor.destroy();
    rerender({ editor: recreatedEditor });

    expect(result.current).toBe(true);

    recreatedEditor.destroy();
  });
});
