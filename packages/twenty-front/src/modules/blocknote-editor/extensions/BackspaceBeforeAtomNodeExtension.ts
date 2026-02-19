import { Plugin, PluginKey } from 'prosemirror-state';

// Fixes a bug where pressing Backspace/Delete adjacent to an atom inline node
// (e.g. a mention chip) fails to delete the neighboring text character.
//
// Root cause: the browser's contenteditable engine doesn't correctly handle
// removal of text next to atom inline nodes, and ProseMirror's DOM observation
// can't recover from the resulting DOM state.
//
// This plugin intercepts Backspace/Delete only when:
//   - The cursor is collapsed (no selection range)
//   - The adjacent node in the deletion direction is an atom inline node
//   - The content on the opposite side (what will be deleted) is text
//
// The nodeBefore/nodeAfter guards are critical: for Backspace we check that
// nodeBefore is a text node (not another atom), which distinguishes
// "text|atom" (broken case we fix) from "atom|atom" (two adjacent mentions,
// ProseMirror handles correctly). Without this guard, tr.delete(pos-1, pos)
// would slice into the preceding atom node and corrupt the document.
//
// See:
// - https://github.com/ProseMirror/prosemirror/issues/1263
// - https://discuss.prosemirror.net/t/cursor-and-backspace-problems-with-inline-nodes/3469

const PLUGIN_KEY = new PluginKey('backspaceBeforeAtomNode');

// Atom nodes are represented as spaces in textBetween calls so that
// word boundary detection naturally stops at atom nodes, preventing
// Ctrl/Alt+Backspace/Delete from deleting mention chips.
const ATOM_NODE_REPLACEMENT = ' ';

// Find the start position of the previous word boundary.
// Scans backwards: skips trailing whitespace, then skips non-whitespace.
export const findWordBoundaryBefore = (text: string): number => {
  let index = text.length;

  while (index > 0 && /\s/.test(text[index - 1])) {
    index--;
  }

  while (index > 0 && !/\s/.test(text[index - 1])) {
    index--;
  }

  return index;
};

// Find the end position of the next word boundary.
// Scans forward: skips leading whitespace, then skips non-whitespace.
export const findWordBoundaryAfter = (text: string): number => {
  let index = 0;

  while (index < text.length && /\s/.test(text[index])) {
    index++;
  }

  while (index < text.length && !/\s/.test(text[index])) {
    index++;
  }

  return index;
};

export const backspaceBeforeAtomNodePlugin = new Plugin({
  key: PLUGIN_KEY,
  props: {
    handleKeyDown: (view, event) => {
      const isBackspace = event.key === 'Backspace';
      const isDelete = event.key === 'Delete';

      if (!isBackspace && !isDelete) {
        return false;
      }

      if (event.metaKey) {
        return false;
      }

      const { state } = view;
      const { selection } = state;

      if (!selection.empty) {
        return false;
      }

      const { $from } = selection;
      const isWordModifier = event.ctrlKey || event.altKey;

      if (isBackspace) {
        if ($from.parentOffset === 0) {
          return false;
        }

        const nodeAfter = $from.nodeAfter;

        // Only intervene when nodeAfter is a non-text atom inline node.
        // Text nodes also have isAtom=true in ProseMirror (they are leaves),
        // so we must exclude them explicitly.
        if (!nodeAfter?.isAtom || !nodeAfter?.isInline || nodeAfter?.isText) {
          return false;
        }

        // Verify the content before the cursor is text (not another atom node).
        // When two adjacent mentions exist (atom|atom), nodeBefore is an atom
        // and ProseMirror handles Backspace correctly — we must not intervene.
        const nodeBefore = $from.nodeBefore;

        if (!nodeBefore?.isText) {
          return false;
        }

        let deleteFrom: number;

        if (isWordModifier) {
          const textBefore = $from.parent.textBetween(
            0,
            $from.parentOffset,
            undefined,
            ATOM_NODE_REPLACEMENT,
          );
          const wordStart = findWordBoundaryBefore(textBefore);

          deleteFrom = $from.pos - (textBefore.length - wordStart);
        } else {
          deleteFrom = $from.pos - 1;
        }

        view.dispatch(state.tr.delete(deleteFrom, $from.pos));

        return true;
      }

      if (isDelete) {
        const nodeBefore = $from.nodeBefore;

        // Only intervene when nodeBefore is a non-text atom inline node.
        if (
          !nodeBefore?.isAtom ||
          !nodeBefore?.isInline ||
          nodeBefore?.isText
        ) {
          return false;
        }

        const nodeAfter = $from.nodeAfter;

        if (!nodeAfter?.isText) {
          return false;
        }

        let deleteTo: number;

        if (isWordModifier) {
          const parentEnd = $from.end();
          const textAfter = $from.parent.textBetween(
            $from.parentOffset,
            parentEnd - $from.start(),
            undefined,
            ATOM_NODE_REPLACEMENT,
          );
          const wordEnd = findWordBoundaryAfter(textAfter);

          deleteTo = $from.pos + wordEnd;
        } else {
          deleteTo = $from.pos + 1;
        }

        view.dispatch(state.tr.delete($from.pos, deleteTo));

        return true;
      }

      return false;
    },
  },
});
