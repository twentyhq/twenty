import { ResizableImageView } from '@/workflow/workflow-steps/workflow-actions/email-action/extensions/resizable-image/ResizableImageView';
import {
  type ImageOptions,
  Image as TiptapImage,
} from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';

export const ResizableImage = TiptapImage.extend<ImageOptions>({
  selectable: true,

  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: null,
      },
    };
  },

  addNodeView: () => {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});
