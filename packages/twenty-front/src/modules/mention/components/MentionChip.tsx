import { RecordLink } from '@/ai/components/RecordLink';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';

export const MentionChip = ({ node }: NodeViewProps) => {
  const recordId = node.attrs.recordId as string;
  const objectNameSingular = node.attrs.objectNameSingular as string;
  const label = node.attrs.label as string;

  return (
    <NodeViewWrapper as="span" style={{ display: 'inline' }}>
      <RecordLink
        objectNameSingular={objectNameSingular}
        recordId={recordId}
        displayName={label}
      />
    </NodeViewWrapper>
  );
};
