import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldMetadataItemRelation } from '@/object-metadata/types/FieldMetadataItemRelation';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';

export type ManyToOneRelationFieldMetadataItem = FieldMetadataItem & {
  relation: FieldMetadataItemRelation;
};

// Field order from the API is not stable, so ties between several relations to the same object are broken by name.
export const findManyToOneRelationFieldTargetingObject = ({
  fields,
  targetObjectMetadataId,
}: {
  fields: FieldMetadataItem[];
  targetObjectMetadataId: string;
}): ManyToOneRelationFieldMetadataItem | undefined =>
  fields
    .filter(isManyToOneRelationField)
    .filter(
      (field) =>
        field.isActive &&
        field.relation.targetObjectMetadata.id === targetObjectMetadataId,
    )
    .toSorted((fieldA, fieldB) => fieldA.name.localeCompare(fieldB.name))[0];
