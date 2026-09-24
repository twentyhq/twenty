import { type NodeViewProps } from '@tiptap/core';
import { NodeViewWrapper } from '@tiptap/react';

import { SkillReferenceChip } from '@/skill-suggestion/components/SkillReferenceChip';

type SkillChipProps = Pick<NodeViewProps, 'node'>;

export const SkillChip = ({ node }: SkillChipProps) => {
  const skillId = node.attrs.skillId as string;
  const label = node.attrs.label as string;
  const icon = (node.attrs.icon as string | null) ?? null;

  return (
    <NodeViewWrapper as="span" style={{ display: 'inline' }}>
      <SkillReferenceChip skillId={skillId} label={label} icon={icon} />
    </NodeViewWrapper>
  );
};
