import { BaseChip } from '@/object-record/record-field/ui/form-types/components/BaseChip';
import { styled } from '@linaria/react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledWrapper = styled.span`
  display: inline-block;
  padding-inline: ${themeCssVariables.spacing[0.5]};
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
