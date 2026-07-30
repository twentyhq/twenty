import { type Editor } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

const INSPECTABLE_NODE_TYPES: readonly string[] = [
  TIPTAP_NODE_TYPES.EMAIL_SECTION,
  TIPTAP_NODE_TYPES.EMAIL_COLUMNS,
  TIPTAP_NODE_TYPES.EMAIL_COLUMN,
  TIPTAP_NODE_TYPES.EMAIL_BUTTON,
  TIPTAP_NODE_TYPES.EMAIL_DIVIDER,
  TIPTAP_NODE_TYPES.EMAIL_HTML,
];

export type EmailBlockSelectionTarget = {
  nodeType: string;
  pos: number;
  attrs: Record<string, unknown>;
};

// Derives the email block the settings panel should edit from the current
// selection: the selected atom node itself, or the deepest inspectable
// ancestor of the cursor (a button inside a section targets the button).
export const getEmailBlockSelectionTarget = (
  editor: Editor,
): EmailBlockSelectionTarget | null => {
  const { selection } = editor.state;

  if (
    selection instanceof NodeSelection &&
    INSPECTABLE_NODE_TYPES.includes(selection.node.type.name)
  ) {
    return {
      nodeType: selection.node.type.name,
      pos: selection.from,
      // Spread: ProseMirror attrs have a null prototype, which breaks the
      // deep-equality check useEditorState runs on selector results.
      attrs: { ...selection.node.attrs },
    };
  }

  const { $from } = selection;
  for (let depth = $from.depth; depth > 0; depth--) {
    const node = $from.node(depth);
    if (INSPECTABLE_NODE_TYPES.includes(node.type.name)) {
      return {
        nodeType: node.type.name,
        pos: $from.before(depth),
        attrs: { ...node.attrs },
      };
    }
  }

  return null;
};
