import {
  isAdvancedTextEditorBlockNodeType,
  type AdvancedTextEditorBlockNodeType,
} from '@/advanced-text-editor/types/AdvancedTextEditorBlockCatalog';
import { type Editor } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';

export type BlockSelectionTarget = {
  nodeType: AdvancedTextEditorBlockNodeType;
  pos: number;
  attrs: Record<string, unknown>;
};

export const getBlockSelectionTarget = (
  editor: Editor,
): BlockSelectionTarget | null => {
  const { selection } = editor.state;

  if (
    selection instanceof NodeSelection &&
    isAdvancedTextEditorBlockNodeType(selection.node.type.name)
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
    if (isAdvancedTextEditorBlockNodeType(node.type.name)) {
      return {
        nodeType: node.type.name,
        pos: $from.before(depth),
        attrs: { ...node.attrs },
      };
    }
  }

  return null;
};
