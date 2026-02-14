import { MentionRecordChip } from '@/mention/components/MentionRecordChip';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';

export const MentionChip = ({ node }: NodeViewProps) => {
  const recordId = node.attrs.recordId as string;
  const objectNameSingular = node.attrs.objectNameSingular as string;
  const label = node.attrs.label as string;
  const imageUrl = (node.attrs.imageUrl as string) ?? '';

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
