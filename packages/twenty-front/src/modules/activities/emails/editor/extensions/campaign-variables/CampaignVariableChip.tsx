import { VariableChip } from '@/advanced-text-editor/extensions/variable-tag/VariableChip';
import { type NodeViewProps } from '@tiptap/react';

type CampaignVariableChipProps = NodeViewProps;

export const CampaignVariableChip = ({
  deleteNode,
  editor,
  node,
}: CampaignVariableChipProps) => {
  const variable =
    typeof node.attrs.variable === 'string' ? node.attrs.variable : '';

  return (
    <VariableChip deleteNode={deleteNode} editor={editor} label={variable} />
  );
};
