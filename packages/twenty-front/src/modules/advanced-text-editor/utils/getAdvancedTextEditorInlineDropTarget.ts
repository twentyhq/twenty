import { type AdvancedTextEditorBlockDropTarget } from '@/advanced-text-editor/types/AdvancedTextEditorBlockDropTarget';
import { type Editor } from '@tiptap/core';
import { type NodeType } from '@tiptap/pm/model';
import { isDefined } from 'twenty-shared/utils';

const CARET_WIDTH_PX = 2;

type GetAdvancedTextEditorInlineDropTargetArgs = {
  editor: Editor;
  draggedNodeType: NodeType;
  clientX: number;
  clientY: number;
};

export const getAdvancedTextEditorInlineDropTarget = ({
  editor,
  draggedNodeType,
  clientX,
  clientY,
}: GetAdvancedTextEditorInlineDropTargetArgs): AdvancedTextEditorBlockDropTarget | null => {
  const { view, state } = editor;
  const editorRect = view.dom.getBoundingClientRect();

  const isInsideEditor =
    clientX >= editorRect.left &&
    clientX <= editorRect.right &&
    clientY >= editorRect.top &&
    clientY <= editorRect.bottom;

  if (!isInsideEditor) {
    return null;
  }

  const position = view.posAtCoords({ left: clientX, top: clientY });

  if (!isDefined(position)) {
    return null;
  }

  const $position = state.doc.resolve(position.pos);
  const index = $position.index();

  if (
    !$position.parent.inlineContent ||
    !$position.parent.canReplaceWith(index, index, draggedNodeType)
  ) {
    return null;
  }

  const caretCoords = view.coordsAtPos(position.pos);

  return {
    from: position.pos,
    to: position.pos,
    indicatorTop: caretCoords.top,
    indicatorLeft: caretCoords.left - CARET_WIDTH_PX / 2,
    indicatorWidth: CARET_WIDTH_PX,
    indicatorHeight: caretCoords.bottom - caretCoords.top,
  };
};
