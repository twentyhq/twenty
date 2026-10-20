import { type Editor } from '@tiptap/core';
import { type Node } from '@tiptap/pm/model';
import {
  getTipTapFileUrlAttributeName,
  type TIPTAP_NODE_TYPES,
} from 'twenty-shared/utils';

type InsertUploadingNodeArgs<TUploaded> = {
  editor: Editor;
  file: File;
  pos?: number;
  nodeType: typeof TIPTAP_NODE_TYPES.IMAGE | typeof TIPTAP_NODE_TYPES.FILE;
  placeholderAttributes: Record<string, unknown>;
  upload: (file: File) => Promise<TUploaded>;
  getUploadedAttributes: (uploaded: TUploaded) => Record<string, unknown>;
  onUploadError?: (error: Error, file: File) => void;
};

export const insertUploadingNode = <TUploaded>({
  editor,
  file,
  pos,
  nodeType,
  placeholderAttributes,
  upload,
  getUploadedAttributes,
  onUploadError,
}: InsertUploadingNodeArgs<TUploaded>) => {
  const { view } = editor;
  const placeholderUrl = URL.createObjectURL(file);
  const urlAttributeName = getTipTapFileUrlAttributeName(nodeType) ?? 'url';

  const isPlaceholderNode = (node: Node) =>
    node.type.name === nodeType &&
    node.attrs[urlAttributeName] === placeholderUrl;

  const placeholderNode = view.state.schema.nodes[nodeType].create({
    ...placeholderAttributes,
    [urlAttributeName]: placeholderUrl,
  });

  view.dispatch(
    view.state.tr.insert(
      pos ?? view.state.selection.$head.pos,
      placeholderNode,
    ),
  );

  upload(file)
    .then((uploaded) => {
      const updateTr = view.state.tr;

      view.state.doc.descendants((node, nodePos) => {
        if (isPlaceholderNode(node)) {
          updateTr.setNodeMarkup(nodePos, undefined, {
            ...node.attrs,
            ...getUploadedAttributes(uploaded),
          });
          return false;
        }
      });

      view.dispatch(updateTr.setMeta('addToHistory', false));
    })
    .catch((error: Error) => {
      const removeTr = view.state.tr;

      view.state.doc.descendants((node, nodePos) => {
        if (isPlaceholderNode(node)) {
          removeTr.delete(nodePos, nodePos + node.nodeSize);
          return false;
        }
      });

      view.dispatch(removeTr.setMeta('addToHistory', false));

      onUploadError?.(error, file);
    })
    .finally(() => {
      URL.revokeObjectURL(placeholderUrl);
    });
};
