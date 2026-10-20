import { ReactNodeViewRenderer } from '@tiptap/react';

import { VariableTag } from '@/advanced-text-editor/extensions/variable-tag/VariableTag';
import { TemplateVariableWithFallbackChip } from '@/advanced-text-editor/extensions/variable-tag/TemplateVariableWithFallbackChip';

export const TemplateVariableWithFallbackTag = VariableTag.extend({
  addNodeView() {
    return ReactNodeViewRenderer(TemplateVariableWithFallbackChip);
  },
});
