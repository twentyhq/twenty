import { VariableChip } from '@/object-record/record-field/ui/form-types/components/VariableChip';
import styled from '@emotion/styled';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';

const StyledWrapper = styled.span`
  display: inline-block;
  padding-inline: ${({ theme }) => theme.spacing(0.5)};
`;

type WorkflowTextEditorVariableChipProps = NodeViewProps;

export const WorkflowTextEditorVariableChip = ({
  deleteNode,
  node,
  editor,
}: WorkflowTextEditorVariableChipProps) => {
  const attrs = node.attrs as {
    variable: string;
  };

  return (
    <NodeViewWrapper as={StyledWrapper} style={{ whiteSpace: 'nowrap' }}>
      <VariableChip
        rawVariableName={attrs.variable}
        onRemove={editor.isEditable ? deleteNode : undefined}
      />
    </NodeViewWrapper>
  );
};
