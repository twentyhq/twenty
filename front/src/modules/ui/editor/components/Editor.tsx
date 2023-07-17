import { EditorContent, useEditor } from '@tiptap/react';

import { TiptapExtensions } from '../editor-config/extensions';
import { TiptapEditorProps } from '../editor-config/props';

import { EditorBubbleMenu } from './EditorBubbleMenu';

export function Editor() {
  const editor = useEditor({
    extensions: TiptapExtensions,
    editorProps: TiptapEditorProps,
    content: '<p>Hello World!</p>',
  });

  return (
    <>
      {editor && <EditorBubbleMenu editor={editor} />}
      <EditorContent editor={editor} />
    </>
  );
}
