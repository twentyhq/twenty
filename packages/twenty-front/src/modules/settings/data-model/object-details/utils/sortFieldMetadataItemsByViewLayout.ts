import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const sortFieldMetadataItemsByViewLayout = ({
  fieldMetadataItems,
  positionByFieldMetadataId,
}: {
  fieldMetadataItems: FieldMetadataItem[];
  positionByFieldMetadataId: Map<string, number>;
}): FieldMetadataItem[] =>
  [...fieldMetadataItems].sort((fieldA, fieldB) => {
    const positionA = positionByFieldMetadataId.get(fieldA.id);
    const positionB = positionByFieldMetadataId.get(fieldB.id);

    if (isDefined(positionA) && isDefined(positionB)) {
      if (positionA !== positionB) {
        return positionA - positionB;
      }

      return fieldA.label.localeCompare(fieldB.label);
    }

    if (isDefined(positionA)) {
      return -1;
    }

    if (isDefined(positionB)) {
      return 1;
    }

    return fieldA.label.localeCompare(fieldB.label);
  });
