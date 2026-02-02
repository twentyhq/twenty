import { BaseChip } from '@/object-record/record-field/ui/form-types/components/BaseChip';
import styled from '@emotion/styled';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';

const StyledWrapper = styled.span`
  display: inline-block;
  padding-inline: ${({ theme }) => theme.spacing(0.5)};
`;

type WorkflowTextEditorTextChipProps = NodeViewProps;

export const WorkflowTextEditorTextChip = ({
  deleteNode,
  node,
  editor,
}: WorkflowTextEditorTextChipProps) => {
  const text = node.attrs.text as string;

  return (
    <NodeViewWrapper as={StyledWrapper} style={{ whiteSpace: 'nowrap' }}>
      <BaseChip
        label={text}
        onRemove={editor.isEditable ? deleteNode : undefined}
      />
    </NodeViewWrapper>
  );
};
