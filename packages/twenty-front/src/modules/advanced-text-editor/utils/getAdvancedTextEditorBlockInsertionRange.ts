import { ADVANCED_TEXT_EDITOR_BLOCK_CONTAINER_NODE_TYPES } from '@/advanced-text-editor/constants/AdvancedTextEditorBlockContainerNodeTypes';
import { type AdvancedTextEditorBlockRange } from '@/advanced-text-editor/types/AdvancedTextEditorBlockRange';
import { type Editor } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

const isBlockParent = (nodeTypeName: string) =>
  nodeTypeName === TIPTAP_NODE_TYPES.DOCUMENT ||
  (ADVANCED_TEXT_EDITOR_BLOCK_CONTAINER_NODE_TYPES.includes(nodeTypeName) &&
    nodeTypeName !== TIPTAP_NODE_TYPES.COLUMNS);

const getPositionAfterSelectedBlock = (editor: Editor) => {
  const { selection } = editor.state;

  if (selection instanceof NodeSelection) {
    return selection.to;
  }

  const { $from } = selection;

  for (let depth = $from.depth; depth > 0; depth--) {
    if (isBlockParent($from.node(depth - 1).type.name)) {
      return $from.after(depth);
    }
  }

  return editor.state.doc.content.size;
};

export const getAdvancedTextEditorBlockInsertionRange = (
  editor: Editor,
): AdvancedTextEditorBlockRange => {
  if (editor.isEmpty) {
    return { from: 0, to: editor.state.doc.content.size };
  }

  const insertionPos = getPositionAfterSelectedBlock(editor);

  return { from: insertionPos, to: insertionPos };
};
