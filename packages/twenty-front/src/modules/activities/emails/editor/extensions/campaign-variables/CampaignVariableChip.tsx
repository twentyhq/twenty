import { BaseChip } from '@/ui/input/components/BaseChip';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledWrapper = styled.span`
  display: inline-block;
  padding-inline: ${themeCssVariables.spacing[0.5]};
`;

type CampaignVariableChipProps = NodeViewProps;

export const CampaignVariableChip = ({
  deleteNode,
  editor,
  node,
}: CampaignVariableChipProps) => {
  const variable =
    typeof node.attrs.variable === 'string' ? node.attrs.variable : '';

  return (
    <NodeViewWrapper as={StyledWrapper} style={{ whiteSpace: 'nowrap' }}>
      <BaseChip
        label={variable}
        onRemove={editor.isEditable ? deleteNode : undefined}
        removeAriaLabel={t`Remove variable`}
      />
    </NodeViewWrapper>
  );
};
