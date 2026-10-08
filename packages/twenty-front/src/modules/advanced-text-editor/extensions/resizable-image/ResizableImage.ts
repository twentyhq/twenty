import { ResizableImageView } from '@/advanced-text-editor/extensions/resizable-image/ResizableImageView';
import {
  type ImageOptions,
  Image as TiptapImage,
} from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';

export const ResizableImage = TiptapImage.extend<ImageOptions>({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: 'left',
      },
      width: {
        default: null,
      },
      fileId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-file-id'),
        renderHTML: (attributes) =>
          attributes.fileId ? { 'data-file-id': attributes.fileId } : {},
      },
      href: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-href'),
        renderHTML: (attributes) =>
          attributes.href ? { 'data-href': attributes.href } : {},
      },
    };
  },

  addNodeView: () => {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});
