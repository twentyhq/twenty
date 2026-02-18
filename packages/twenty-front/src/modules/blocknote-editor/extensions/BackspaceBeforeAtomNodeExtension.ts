import { type EditorView } from 'prosemirror-view';

export const handleBackspaceBeforeAtomNode = (
  view: EditorView,
  event: KeyboardEvent,
): boolean => {
  if (event.key !== 'Backspace') {
    return false;
  }

  const { state } = view;
  const { selection } = state;

  if (!selection.empty) {
    return false;
  }

  const { $from } = selection;

  if ($from.parentOffset === 0) {
    return false;
  }

  const nodeAfter = $from.nodeAfter;

  if (!nodeAfter?.isAtom || !nodeAfter?.isInline) {
    return false;
  }

  const nodeBefore = $from.nodeBefore;

  if (nodeBefore?.isAtom) {
    return false;
  }

  const from = $from.pos - 1;
  const to = $from.pos;

  view.dispatch(state.tr.delete(from, to));

  return true;

  return true;
};
