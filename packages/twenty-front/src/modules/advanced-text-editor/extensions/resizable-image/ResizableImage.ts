import { ResizableImageView } from '@/advanced-text-editor/extensions/resizable-image/ResizableImageView';
import {
  type ImageOptions,
  Image as TiptapImage,
} from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';

const imageAlignments = ['left', 'center', 'right'] as const;

type ImageAlignment = (typeof imageAlignments)[number];

const isImageAlignment = (value: string | null): value is ImageAlignment =>
  value !== null && (imageAlignments as readonly string[]).includes(value);

export const ResizableImage = TiptapImage.extend<ImageOptions>({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: null,
        parseHTML: (element) => {
          const align = element.getAttribute('align');

          if (isImageAlignment(align)) {
            return align;
          }

          const float = element.style.float;

          if (isImageAlignment(float)) {
            return float;
          }

          return null;
        },
        renderHTML: (attributes) => {
          const align = attributes.align;

          return typeof align === 'string' && isImageAlignment(align)
            ? { align }
            : {};
        },
      },
    };
  },

  addNodeView: () => {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});
