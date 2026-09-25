import { type AdvancedTextEditorBlockRange } from '@/advanced-text-editor/types/AdvancedTextEditorBlockRange';
import { type Editor, type JSONContent } from '@tiptap/core';
import { Selection } from '@tiptap/pm/state';

export const insertAdvancedTextEditorBlock = (
  editor: Editor,
  range: AdvancedTextEditorBlockRange,
  content: JSONContent,
) =>
  editor
    .chain()
    .insertContentAt(range, content)
    .command(({ tr }) => {
      tr.setSelection(Selection.near(tr.doc.resolve(range.from + 1)));
      return true;
    })
    .scrollIntoView()
    .focus(null, { scrollIntoView: false })
    .run();
