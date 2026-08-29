import { VariableTag } from '@/advanced-text-editor/extensions/variable-tag/VariableTag';
import { WorkflowTextEditorVariableChip } from '@/workflow/workflow-variables/components/WorkflowTextEditorVariableChip';
import { ReactNodeViewRenderer } from '@tiptap/react';

export const WorkflowVariableTag = VariableTag.extend({
  addNodeView() {
    return ReactNodeViewRenderer(WorkflowTextEditorVariableChip);
  },
});
