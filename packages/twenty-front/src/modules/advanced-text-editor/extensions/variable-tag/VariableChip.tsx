import { BaseChip } from '@/ui/input/components/BaseChip';
import { styled } from '@linaria/react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { themeCssVariables } from 'twenty-ui/theme';
import { useLingui } from '@lingui/react/macro';

const StyledWrapper = styled.span`
  display: inline-block;
  padding-inline: ${themeCssVariables.spacing[0.5]};
`;

type VariableChipProps = Pick<NodeViewProps, 'deleteNode' | 'editor'> & {
  label: string;
  title?: string;
};

export const VariableChip = ({
  deleteNode,
  editor,
  label,
  title,
}: VariableChipProps) => {
  const { t } = useLingui();
  return (
    <NodeViewWrapper as={StyledWrapper} style={{ whiteSpace: 'nowrap' }}>
      <BaseChip
        label={label}
        title={title}
        onRemove={editor.isEditable ? deleteNode : undefined}
        removeAriaLabel={t`Remove variable`}
      />
    </NodeViewWrapper>
  );
};
