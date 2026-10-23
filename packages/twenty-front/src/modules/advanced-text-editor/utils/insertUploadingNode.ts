import { type Editor } from '@tiptap/core';
import { type Node } from '@tiptap/pm/model';
import { doNotTranslate } from 'twenty-shared/i18n';
import {
  getTipTapFileUrlAttributeName,
  isDefined,
  type TIPTAP_NODE_TYPES,
} from 'twenty-shared/utils';

import { type UploadErrorHandler } from '@/advanced-text-editor/types/UploadErrorHandler';

type InsertUploadingNodeArgs<TUploaded> = {
  editor: Editor;
  file: File;
  pos?: number;
  nodeType: typeof TIPTAP_NODE_TYPES.IMAGE | typeof TIPTAP_NODE_TYPES.FILE;
  placeholderAttributes: Record<string, unknown>;
  upload: (file: File) => Promise<TUploaded>;
  getUploadedAttributes: (uploaded: TUploaded) => Record<string, unknown>;
  onUploadError?: UploadErrorHandler;
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
  const urlAttributeName = getTipTapFileUrlAttributeName(nodeType);

  if (!isDefined(urlAttributeName)) {
    throw new Error(
      doNotTranslate(`No file URL attribute for node type ${nodeType}`),
    );
  }

  const { view } = editor;
  const placeholderUrl = URL.createObjectURL(file);

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

      onUploadError?.({ error, file });
    })
    .finally(() => {
      URL.revokeObjectURL(placeholderUrl);
    });
};
