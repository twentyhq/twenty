import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

export const sortFieldsByRelevanceForRecordTableWidget = (
  labelIdentifierFieldMetadataId: string,
) => {
  return (fieldA: FieldMetadataItem, fieldB: FieldMetadataItem): number => {
    if (fieldA.id === labelIdentifierFieldMetadataId) {
      return -1;
    }

    if (fieldB.id === labelIdentifierFieldMetadataId) {
      return 1;
    }

    const isFieldAReverseSide =
      fieldA.type === FieldMetadataType.RELATION &&
      fieldA.settings?.relationType === RelationType.ONE_TO_MANY;
    const isFieldBReverseSide =
      fieldB.type === FieldMetadataType.RELATION &&
      fieldB.settings?.relationType === RelationType.ONE_TO_MANY;

    if (isFieldAReverseSide && !isFieldBReverseSide) return 1;
    if (!isFieldAReverseSide && isFieldBReverseSide) return -1;

    const isFieldARelation = fieldA.type === FieldMetadataType.RELATION;
    const isFieldBRelation = fieldB.type === FieldMetadataType.RELATION;

    if (isFieldARelation && !isFieldBRelation) {
      return 1;
    }

    if (!isFieldARelation && isFieldBRelation) {
      return -1;
    }

    return 0;
  };
};
