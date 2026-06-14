import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

import { type FieldMorphRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { computeMorphRelationGqlFieldName } from 'twenty-shared/utils';

export const getMorphRelationFromFieldMetadataAndGqlField = ({
  objectMetadataItems,
  fieldMetadata,
  gqlField,
}: {
  objectMetadataItems: EnrichedObjectMetadataItem[];
  fieldMetadata: Pick<FieldMorphRelationMetadata, 'morphRelations'>;
  gqlField: string;
}) => {
  const possibleMorphRelationGqlFields = fieldMetadata.morphRelations.map(
    (morphRelation) => {
      const targetObjectMetadata = objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.id === morphRelation.targetObjectMetadata.id,
      );
      if (!targetObjectMetadata) {
        return {
          gqlField: undefined,
          morphRelation: undefined,
        };
      }
      const computedName = computeMorphRelationGqlFieldName({
        fieldName: morphRelation.sourceFieldMetadata.name,
        relationType: morphRelation.type,
        targetObjectMetadataNameSingular: targetObjectMetadata.nameSingular,
        targetObjectMetadataNamePlural: targetObjectMetadata.namePlural,
      });

      return {
        gqlField: computedName,
        morphRelation,
      };
    },
  );

  const gqlFieldMorphRelation = possibleMorphRelationGqlFields.find(
    (possibeMorphRelationGqlField) =>
      possibeMorphRelationGqlField.gqlField === gqlField,
  );

  if (!gqlFieldMorphRelation || !gqlFieldMorphRelation.morphRelation) {
    return undefined;
  }

  return {
    morphRelation: gqlFieldMorphRelation.morphRelation,
    targetObjectMetadata: objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.id ===
        gqlFieldMorphRelation.morphRelation.targetObjectMetadata.id,
    ),
  };
};
