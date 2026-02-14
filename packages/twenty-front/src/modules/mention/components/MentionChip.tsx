import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { AvatarChip, ChipVariant, LinkChip } from 'twenty-ui/components';

export const MentionChip = ({ node }: NodeViewProps) => {
  const recordId = node.attrs.recordId as string;
  const objectNameSingular = node.attrs.objectNameSingular as string;
  const label = node.attrs.label as string;
  const imageUrl = (node.attrs.imageUrl as string) ?? '';

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  if (!objectMetadataItem || !isNonEmptyString(recordId)) {
    return (
      <NodeViewWrapper as="span" style={{ display: 'inline' }}>
        <span>{label}</span>
      </NodeViewWrapper>
    );
  }

  const linkToShowPage = getLinkToShowPage(objectNameSingular, {
    id: recordId,
  });

  return (
    <NodeViewWrapper as="span" style={{ display: 'inline' }}>
      <LinkChip
        label={label}
        emptyLabel={t`Untitled`}
        to={linkToShowPage}
        variant={ChipVariant.Highlighted}
        leftComponent={
          <AvatarChip
            placeholder={label}
            placeholderColorSeed={recordId}
            avatarType="rounded"
            avatarUrl={imageUrl}
          />
        }
      />
    </NodeViewWrapper>
  );
};
