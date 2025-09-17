import { ResizableImageView } from '@/workflow/workflow-steps/workflow-actions/email-action/extensions/ResizableImageView';
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
        default: null,
      },
    };
  },

  addNodeView: () => {
    return ReactNodeViewRenderer(ResizableImageView);
  },
});
