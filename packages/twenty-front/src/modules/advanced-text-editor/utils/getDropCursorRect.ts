import { type EditorView } from '@tiptap/pm/view';
import { isDefined } from 'twenty-shared/utils';

const DROP_CURSOR_THICKNESS = 2;

const getNodeRect = (view: EditorView, position: number) => {
  const nodeElement = view.nodeDOM(position);

  return nodeElement instanceof HTMLElement
    ? nodeElement.getBoundingClientRect()
    : null;
};

const getLineTop = (rectBefore: DOMRect | null, rectAfter: DOMRect | null) => {
  if (isDefined(rectBefore) && isDefined(rectAfter)) {
    return (rectBefore.bottom + rectAfter.top) / 2;
  }

  return rectBefore?.bottom ?? rectAfter?.top ?? null;
};

type GetDropCursorRectArgs = {
  view: EditorView;
  position: number;
};

export const getDropCursorRect = ({
  view,
  position,
}: GetDropCursorRectArgs) => {
  const $position = view.state.doc.resolve(position);
  const { nodeBefore, nodeAfter } = $position;

  if (!$position.parent.inlineContent) {
    const rectBefore = isDefined(nodeBefore)
      ? getNodeRect(view, position - nodeBefore.nodeSize)
      : null;
    const rectAfter = isDefined(nodeAfter) ? getNodeRect(view, position) : null;
    const referenceRect = rectBefore ?? rectAfter;
    const lineTop = getLineTop(rectBefore, rectAfter);

    if (isDefined(referenceRect) && isDefined(lineTop)) {
      return new DOMRect(
        referenceRect.left,
        lineTop - DROP_CURSOR_THICKNESS / 2,
        referenceRect.width,
        DROP_CURSOR_THICKNESS,
      );
    }
  }

  const caretRect = view.coordsAtPos(position);

  return new DOMRect(
    caretRect.left - DROP_CURSOR_THICKNESS / 2,
    caretRect.top,
    DROP_CURSOR_THICKNESS,
    caretRect.bottom - caretRect.top,
  );
};
