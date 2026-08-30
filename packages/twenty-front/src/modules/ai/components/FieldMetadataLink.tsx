import { FieldMetadataChip } from '@/ai/components/FieldMetadataChip';
import { useChatReferenceTarget } from '@/ai/hooks/useChatReferenceTarget';

type FieldMetadataLinkProps = {
  objectNameSingular: string;
  fieldName: string;
  displayName: string;
};

export const FieldMetadataLink = ({
  objectNameSingular,
  fieldName,
  displayName,
}: FieldMetadataLinkProps) => {
  const target = useChatReferenceTarget({
    kind: 'field',
    objectNameSingular,
    fieldName,
  });

  return (
    <FieldMetadataChip
      displayName={displayName}
      target={target}
      fieldMetadataItem={target.fieldMetadataItem}
    />
  );
};
