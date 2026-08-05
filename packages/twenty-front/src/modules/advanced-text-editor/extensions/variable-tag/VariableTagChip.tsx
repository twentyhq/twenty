import { BaseChip } from '@/ui/input/components/BaseChip';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { extractRawVariableNamePart } from 'twenty-shared/workflow';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledWrapper = styled.span`
  display: inline-block;
  padding-inline: ${themeCssVariables.spacing[0.5]};
`;

type VariableTagChipProps = NodeViewProps;

export const VariableTagChip = ({
  deleteNode,
  editor,
  node,
}: VariableTagChipProps) => {
  const variable =
    typeof node.attrs.variable === 'string' ? node.attrs.variable : '';
  const label = extractRawVariableNamePart({
    rawVariableName: variable,
    part: 'selectedField',
  });

  return (
    <NodeViewWrapper as={StyledWrapper} style={{ whiteSpace: 'nowrap' }}>
      <BaseChip
        label={label}
        title={variable}
        onRemove={editor.isEditable ? deleteNode : undefined}
        removeAriaLabel={t`Remove variable`}
      />
    </NodeViewWrapper>
  );
};
