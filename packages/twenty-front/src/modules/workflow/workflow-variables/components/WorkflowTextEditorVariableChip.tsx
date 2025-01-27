import { VariableChip } from '@/object-record/record-field/form-types/components/VariableChip';
import { NodeViewProps, NodeViewWrapper } from '@tiptap/react';

type WorkflowTextEditorVariableChipProps = NodeViewProps;

export const WorkflowTextEditorVariableChip = ({
  deleteNode,
  node,
}: WorkflowTextEditorVariableChipProps) => {
  const attrs = node.attrs as {
    variable: string;
  };

  return (
    <NodeViewWrapper as="span" style={{ whiteSpace: 'nowrap' }}>
      <VariableChip rawVariableName={attrs.variable} onRemove={deleteNode} />
    </NodeViewWrapper>
  );
};
