import { type Editor, type JSONContent } from '@tiptap/core';
import { type Node } from '@tiptap/pm/model';
import {
  getTipTapFileUrlAttributeName,
  isDefined,
  isStorableRichTextUrl,
} from 'twenty-shared/utils';

const isUnstorableUploadNode = (node: Node) => {
  const fileUrlAttributeName = getTipTapFileUrlAttributeName(node.type.name);

  return (
    isDefined(fileUrlAttributeName) &&
    !isStorableRichTextUrl(node.attrs[fileUrlAttributeName])
  );
};

export const getStorableEditorDocument = (editor: Editor): JSONContent => {
  const unstorableNodeRanges: { from: number; to: number }[] = [];

  editor.state.doc.descendants((node, position) => {
    if (isUnstorableUploadNode(node)) {
      unstorableNodeRanges.push({
        from: position,
        to: position + node.nodeSize,
      });

      return false;
    }
  });

  if (unstorableNodeRanges.length === 0) {
    return editor.getJSON();
  }

  const transaction = editor.state.tr;

  for (const { from, to } of unstorableNodeRanges.reverse()) {
    transaction.delete(from, to);
  }

  return transaction.doc.toJSON();
};
