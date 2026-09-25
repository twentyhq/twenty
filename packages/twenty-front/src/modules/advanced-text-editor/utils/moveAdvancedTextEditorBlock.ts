import { type AdvancedTextEditorBlockRange } from '@/advanced-text-editor/types/AdvancedTextEditorBlockRange';
import { type Editor } from '@tiptap/core';
import { Selection } from '@tiptap/pm/state';
import { isDefined } from 'twenty-shared/utils';

export const moveAdvancedTextEditorBlock = (
  editor: Editor,
  sourceRange: AdvancedTextEditorBlockRange,
  targetPos: number,
) =>
  editor
    .chain()
    .command(({ tr }) => {
      const sourceNode = tr.doc.nodeAt(sourceRange.from);

      if (!isDefined(sourceNode)) {
        return false;
      }

      tr.delete(sourceRange.from, sourceRange.to);

      const insertionPos = tr.mapping.map(targetPos);

      tr.insert(insertionPos, sourceNode);
      tr.setSelection(Selection.near(tr.doc.resolve(insertionPos + 1)));
      return true;
    })
    .scrollIntoView()
    .focus(null, { scrollIntoView: false })
    .run();
