import { type EditorState, NodeSelection } from '@tiptap/pm/state';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

const BLOCK_CONTAINER_NODE_TYPES: string[] = [
  TIPTAP_NODE_TYPES.DOCUMENT,
  TIPTAP_NODE_TYPES.SECTION,
  TIPTAP_NODE_TYPES.COLUMN,
];

export const getPositionAfterCurrentBlock = ({
  selection,
  doc,
}: EditorState) => {
  if (selection instanceof NodeSelection && selection.node.isBlock) {
    return selection.to;
  }

  const { $from } = selection;

  for (let depth = $from.depth; depth > 0; depth--) {
    if (BLOCK_CONTAINER_NODE_TYPES.includes($from.node(depth - 1).type.name)) {
      return $from.after(depth);
    }
  }

  return doc.content.size;
};
