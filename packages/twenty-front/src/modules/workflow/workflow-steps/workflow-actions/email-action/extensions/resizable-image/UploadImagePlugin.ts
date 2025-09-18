import { type Editor } from '@tiptap/core';
import { type Node } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { type EditorView } from '@tiptap/pm/view';

export type UploadImagePluginProps = {
  editor: Editor;
  allowedMimeTypes?: string[];
  onImageUpload?: (file: File) => Promise<string>;
};

export const UploadImagePlugin = (options: UploadImagePluginProps) => {
  const { editor, onImageUpload, allowedMimeTypes } = options;

  const handleImageUpload = (view: EditorView, file: File, pos?: number) => {
    const placeholderSrc = URL.createObjectURL(file);

    const { tr, schema } = view.state;
    const imageNode = schema.nodes.image.create({
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

    onImageUpload?.(file)
      .then((uploadedSrc) => {
        const updateTr = view.state.tr;

        const predicate = (node: Node) =>
          node.type.name === 'image' && node.attrs.src === placeholderSrc;

        view.state.doc.descendants((node, pos) => {
          if (predicate(node)) {
            updateTr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              src: uploadedSrc,
            });
            return false;
          }
        });

        view.dispatch(updateTr);
      })
      .finally(() => {
        editor.extensionStorage.uploadImage.placeholderImages.delete(
          placeholderSrc,
        );
        URL.revokeObjectURL(placeholderSrc);
      });
  };

  return new Plugin({
    key: new PluginKey('uploadImage'),
    props: {
      handleDrop: (view, event) => {
        if (!onImageUpload || !event.dataTransfer?.files?.length) {
          return false;
        }

        const images = Array.from(event.dataTransfer.files).filter((file) =>
          allowedMimeTypes?.includes(file.type),
        );
        if (images.length === 0) {
          return false;
        }

        const pos = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        });
        if (!pos) {
          return false;
        }

        event.preventDefault();
        event.stopPropagation();

        images.forEach((file) => handleImageUpload(view, file, pos.pos));
        return true;
      },
      handlePaste: (view, event) => {
        if (!onImageUpload || !event.clipboardData?.files?.length) {
          return false;
        }

        const images = Array.from(event.clipboardData.files).filter((file) =>
          allowedMimeTypes?.includes(file.type),
        );
        if (images.length === 0) {
          return false;
        }

        event.preventDefault();
        event.stopPropagation();

        images.forEach((file) => handleImageUpload(view, file));
        return true;
      },
    },
  });
};
