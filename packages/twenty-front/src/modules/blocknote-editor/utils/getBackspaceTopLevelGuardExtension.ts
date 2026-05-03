import { Extension } from '@tiptap/core';

// Guards against a BlockNote 0.47.x bug where pressing Backspace at the
// beginning of the first top-level block throws:
// RangeError: "There is no position before the top-level node"
// BlockNote's internal parent-block traversal calls
// resolvedPos.before(depth - 1) without checking that depth > 1.
export const getBackspaceTopLevelGuardExtension = () =>
  Extension.create({
    name: 'backspaceTopLevelGuard',
    priority: 1000,
    addKeyboardShortcuts() {
      return {
        Backspace: ({ editor }) => {
          const { $from, empty } = editor.state.selection;

          if (!empty) {
            return false;
          }

          // When the cursor is at the very beginning of the first
          // top-level block (offset 0 and depth ≤ 2 in BlockNote's
          // doc → blockGroup → blockContainer structure), swallow the
          // Backspace to prevent the crash. There is nothing to delete
          // in this position anyway.
          if ($from.parentOffset === 0 && $from.depth <= 2) {
            const atDocStart = $from.before($from.depth) === 1;

            if (atDocStart) {
              return true;
            }
          }

          return false;
        },
      };
    },
  });
