import { Plugin, PluginKey } from 'prosemirror-state';

const PLUGIN_KEY = new PluginKey('backspaceBeforeAtomNode');

const ATOM_NODE_REPLACEMENT = ' ';

const findWordBoundaryBefore = (text: string): number => {
  let index = text.length;

  while (index > 0 && /\s/.test(text[index - 1])) {
    index--;
  }

  while (index > 0 && !/\s/.test(text[index - 1])) {
    index--;
  }

  return index;
};

const findWordBoundaryAfter = (text: string): number => {
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

        if (!nodeAfter?.isAtom || !nodeAfter?.isInline) {
          return false;
        }

        if ($from.textOffset === 0) {
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

        if (!nodeBefore?.isAtom || !nodeBefore?.isInline) {
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
