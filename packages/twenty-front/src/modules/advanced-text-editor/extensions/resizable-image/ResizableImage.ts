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
      // Declared so the resize handle's updateAttributes({ width }) actually
      // persists; undeclared attributes are silently dropped.
      width: {
        default: null,
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
