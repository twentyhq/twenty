import { type NodeViewProps } from '@tiptap/core';
import { NodeViewWrapper } from '@tiptap/react';
import { AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR } from 'twenty-shared/ai';
import { Chip } from 'twenty-ui/primitives/data-display';

import { MentionRecordChip } from '@/mention/components/MentionRecordChip';

type MentionChipProps = Pick<NodeViewProps, 'node'>;

export const MentionChip = ({ node }: MentionChipProps) => {
  const recordId = node.attrs.recordId as string;
  const objectNameSingular = node.attrs.objectNameSingular as string;
  const label = node.attrs.label as string;
  const imageUrl = (node.attrs.imageUrl as string) ?? '';

  if (
    objectNameSingular === AGENT_CHAT_ASSISTANT_MENTION_OBJECT_NAME_SINGULAR
  ) {
    return (
      <NodeViewWrapper as="span" style={{ display: 'inline' }}>
        <Chip variant="soft">{`@${label}`}</Chip>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper as="span" style={{ display: 'inline' }}>
      <MentionRecordChip
        recordId={recordId}
        objectNameSingular={objectNameSingular}
        label={label}
        imageUrl={imageUrl}
      />
    </NodeViewWrapper>
  );
};
