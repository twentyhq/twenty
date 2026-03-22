import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { computePossibleMorphGqlFieldForFieldName } from '@/object-record/cache/utils/computePossibleMorphGqlFieldForFieldName';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';

export const getFieldMetadataFromGqlField = ({
  objectMetadataItem,
  gqlField,
}: {
  objectMetadataItem: Pick<EnrichedObjectMetadataItem, 'fields'>;
  gqlField: string;
}) => {
  return (
    objectMetadataItem.fields.find((field) => field.name === gqlField) ??
    objectMetadataItem.fields.find(
      (field) => field.settings?.joinColumnName === gqlField,
    ) ??
    objectMetadataItem.fields.filter(isFieldMorphRelation).find((field) => {
      const morphRelations = field.morphRelations;
      if (!morphRelations) return false;
      const possibleMorphRelationsNames =
        computePossibleMorphGqlFieldForFieldName({
          fieldMetadata: {
            morphRelations: field.morphRelations ?? [],
            fieldName: field.name,
          },
        });
      return possibleMorphRelationsNames
        .flatMap((possibleMorphRelationName) => [
          possibleMorphRelationName,
          `${possibleMorphRelationName}Id`,
        ])
        .includes(gqlField);
    })
  );
};
