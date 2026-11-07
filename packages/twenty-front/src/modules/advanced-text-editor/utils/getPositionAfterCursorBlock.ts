import { type EditorState } from '@tiptap/pm/state';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

const LIST_ITEM_NODE_TYPES: string[] = [
  TIPTAP_NODE_TYPES.LIST_ITEM,
  TIPTAP_NODE_TYPES.TASK_ITEM,
];

export const getPositionAfterCursorBlock = ({
  selection: { $head },
}: EditorState): number => {
  if ($head.depth === 0) {
    return $head.pos;
  }

  for (let depth = $head.depth; depth > 0; depth--) {
    if (LIST_ITEM_NODE_TYPES.includes($head.node(depth).type.name)) {
      return $head.after(depth);
    }
  }

  return $head.after();
};
