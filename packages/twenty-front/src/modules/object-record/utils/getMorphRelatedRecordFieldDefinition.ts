import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMorphRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isDefined } from 'twenty-shared/utils';

export const getMorphRelatedRecordFieldDefinition = ({
  fieldDefinition,
  relatedObjectMetadataItem,
}: {
  fieldDefinition: FieldDefinition<FieldMorphRelationMetadata>;
  relatedObjectMetadataItem: ObjectMetadataItem;
}) => {
  const fieldMetadataOnRelatedObject =
    fieldDefinition.metadata.morphRelations.find(
      (morphRelation) =>
        morphRelation.targetObjectMetadata.nameSingular ===
        relatedObjectMetadataItem.nameSingular,
    )?.targetFieldMetadata;

  if (!isDefined(fieldMetadataOnRelatedObject)) {
    throw new Error('Could not find field on related object');
  }

  const fieldMetadataNameOnRelatedObject = fieldMetadataOnRelatedObject.name;

  const fieldDefinitions = relatedObjectMetadataItem.fields.map(
    (fieldMetadataItem, index) =>
      formatFieldMetadataItemAsColumnDefinition({
        field: fieldMetadataItem,
        objectMetadataItem: relatedObjectMetadataItem,
        position: index,
      }),
  );

  const relatedRecordFieldDefinition = fieldDefinitions.find(
    (field) => field.metadata.fieldName === fieldMetadataNameOnRelatedObject,
  );

  return relatedRecordFieldDefinition;
};
