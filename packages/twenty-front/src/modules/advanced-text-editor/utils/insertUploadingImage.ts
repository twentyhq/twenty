import { type Editor } from '@tiptap/core';
import { type Node } from '@tiptap/pm/model';
import { isDefined } from 'twenty-shared/utils';

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
  const { tr, schema } = view.state;
  const imageNodeType = schema.nodes.image;

  if (!isDefined(imageNodeType)) {
    return;
  }

  const placeholderSrc = URL.createObjectURL(file);
  const imageNode = imageNodeType.create({
    src: placeholderSrc,
    alt: file.name,
  });

  editor.extensionStorage.uploadImage.placeholderImages.add(placeholderSrc);

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

      view.dispatch(updateTr);
    })
    .catch((error: Error) => {
      const removeTr = view.state.tr;
      const predicate = (node: Node) =>
        node.type.name === 'image' && node.attrs.src === placeholderSrc;

      view.state.doc.descendants((node, pos) => {
        if (predicate(node)) {
          removeTr.delete(pos, pos + node.nodeSize);
          return false; // Stop traversal after finding the target
        }
      });

      view.dispatch(removeTr);

      onImageUploadError?.(error, file);
    })
    .finally(() => {
      editor.extensionStorage.uploadImage.placeholderImages.delete(
        placeholderSrc,
      );
      URL.revokeObjectURL(placeholderSrc);
    });
};
