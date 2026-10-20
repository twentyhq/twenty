import { type Editor } from '@tiptap/core';
import { type Node } from '@tiptap/pm/model';

import { type UploadedImage } from '@/advanced-text-editor/types/UploadedImage';

type InsertUploadingImageArgs = {
  editor: Editor;
  file: File;
  pos?: number;
  onImageUpload: (file: File) => Promise<UploadedImage>;
  onImageUploadError?: (error: Error, file: File) => void;
};

export const insertUploadingImage = ({
  editor,
  file,
  pos,
  onImageUpload,
  onImageUploadError,
}: InsertUploadingImageArgs) => {
  const { view } = editor;
  const placeholderSrc = URL.createObjectURL(file);

  const { tr, schema } = view.state;
  const imageNode = schema.nodes.image.create({
    src: placeholderSrc,
    alt: file.name,
  });

  const resolvedPos =
    pos !== undefined
      ? view.state.doc.resolve(pos)
      : view.state.selection.$head;

  const transaction = tr.insert(resolvedPos.pos, imageNode);
  view.dispatch(transaction);

  onImageUpload(file)
    .then((uploadedImage) => {
      const updateTr = view.state.tr;

      const predicate = (node: Node) =>
        node.type.name === 'image' && node.attrs.src === placeholderSrc;

      view.state.doc.descendants((node, pos) => {
        if (predicate(node)) {
          updateTr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            fileId: uploadedImage.fileId ?? null,
            src: uploadedImage.url,
          });
          return false;
        }
      });

      view.dispatch(updateTr.setMeta('addToHistory', false));
    })
    .catch((error: Error) => {
      const removeTr = view.state.tr;
      const predicate = (node: Node) =>
        node.type.name === 'image' && node.attrs.src === placeholderSrc;

      view.state.doc.descendants((node, pos) => {
        if (predicate(node)) {
          removeTr.delete(pos, pos + node.nodeSize);
          return false;
        }
      });

      view.dispatch(removeTr.setMeta('addToHistory', false));

      onImageUploadError?.(error, file);
    })
    .finally(() => {
      URL.revokeObjectURL(placeholderSrc);
    });
};
