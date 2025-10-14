import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

import { type FieldMorphRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { computeMorphRelationFieldName } from 'twenty-shared/utils';

export const getMorphRelationFromFieldMetadataAndGqlField = ({
  objectMetadataItems,
  fieldMetadata,
  gqlField,
}: {
  objectMetadataItems: ObjectMetadataItem[];
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
      const computedName = computeMorphRelationFieldName({
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
