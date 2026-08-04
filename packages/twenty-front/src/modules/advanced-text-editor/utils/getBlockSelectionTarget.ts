import { type Editor } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

const INSPECTABLE_NODE_TYPES: readonly string[] = [
  TIPTAP_NODE_TYPES.SECTION,
  TIPTAP_NODE_TYPES.COLUMNS,
  TIPTAP_NODE_TYPES.COLUMN,
  TIPTAP_NODE_TYPES.BUTTON,
  TIPTAP_NODE_TYPES.DIVIDER,
  TIPTAP_NODE_TYPES.HTML,
  TIPTAP_NODE_TYPES.IMAGE,
];

export type BlockSelectionTarget = {
  nodeType: string;
  pos: number;
  attrs: Record<string, unknown>;
};

export const getBlockSelectionTarget = (
  editor: Editor,
): BlockSelectionTarget | null => {
  const { selection } = editor.state;

  if (
    selection instanceof NodeSelection &&
    INSPECTABLE_NODE_TYPES.includes(selection.node.type.name)
  ) {
    return {
      nodeType: selection.node.type.name,
      pos: selection.from,
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
