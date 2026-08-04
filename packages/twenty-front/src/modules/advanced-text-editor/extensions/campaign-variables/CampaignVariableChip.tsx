import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';

type CampaignVariableChipProps = Pick<NodeViewProps, 'node'>;

export const CampaignVariableChip = ({ node }: CampaignVariableChipProps) => {
  const variable =
    typeof node.attrs.variable === 'string' ? node.attrs.variable : '';
  return (
    <NodeViewWrapper as="span" data-drag-handle>
      <span className="variable-tag">{variable}</span>
    </NodeViewWrapper>
  );
};
