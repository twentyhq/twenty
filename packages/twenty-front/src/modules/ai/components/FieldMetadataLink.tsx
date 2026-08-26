import { FieldMetadataChip } from '@/ai/components/FieldMetadataChip';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

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
  const objectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: objectNameSingular,
      objectNameType: 'singular',
    },
  );

  const fieldMetadataItem = objectMetadataItem?.fields.find(
    (field) => field.name === fieldName,
  );

  return (
    <FieldMetadataChip
      displayName={displayName}
      objectMetadataItem={objectMetadataItem}
      fieldMetadataItem={fieldMetadataItem}
    />
  );
};
