import { type Editor } from '@tiptap/core';
import { type Node } from '@tiptap/pm/model';
import { TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

import { type UploadedFile } from '@/advanced-text-editor/types/UploadedFile';

type InsertUploadingFileArgs = {
  editor: Editor;
  file: File;
  pos?: number;
  onFileUpload: (file: File) => Promise<UploadedFile>;
  onFileUploadError?: (error: Error, file: File) => void;
};

export const insertUploadingFile = ({
  editor,
  file,
  pos,
  onFileUpload,
  onFileUploadError,
}: InsertUploadingFileArgs) => {
  const { view } = editor;
  const placeholderUrl = URL.createObjectURL(file);

  const isPlaceholderFileNode = (node: Node) =>
    node.type.name === TIPTAP_NODE_TYPES.FILE &&
    node.attrs.url === placeholderUrl;

  const fileNode = view.state.schema.nodes[TIPTAP_NODE_TYPES.FILE].create({
    url: placeholderUrl,
    name: file.name,
  });

  view.dispatch(
    view.state.tr.insert(pos ?? view.state.selection.$head.pos, fileNode),
  );

  onFileUpload(file)
    .then((uploadedFile) => {
      const updateTr = view.state.tr;

      view.state.doc.descendants((node, nodePos) => {
        if (isPlaceholderFileNode(node)) {
          updateTr.setNodeMarkup(nodePos, undefined, {
            ...node.attrs,
            url: uploadedFile.url,
          });
          return false;
        }
      });

      view.dispatch(updateTr.setMeta('addToHistory', false));
    })
    .catch((error: Error) => {
      const removeTr = view.state.tr;

      view.state.doc.descendants((node, nodePos) => {
        if (isPlaceholderFileNode(node)) {
          removeTr.delete(nodePos, nodePos + node.nodeSize);
          return false;
        }
      });

      view.dispatch(removeTr.setMeta('addToHistory', false));

      onFileUploadError?.(error, file);
    })
    .finally(() => {
      URL.revokeObjectURL(placeholderUrl);
    });
};
