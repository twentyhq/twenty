import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';

import { type FieldMorphRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { computeMorphRelationFieldName } from 'twenty-shared/utils';

export const getFieldMetadataMorphRelationFromGqlField = ({
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
    sourceFieldMetadata: getFieldMetadataItemById({
      fieldMetadataId:
        gqlFieldMorphRelation.morphRelation.sourceFieldMetadata.id,
      objectMetadataItems,
    }),
    targetFieldMetadata: getFieldMetadataItemById({
      fieldMetadataId:
        gqlFieldMorphRelation.morphRelation?.targetFieldMetadata.id,
      objectMetadataItems,
    }),
    targetObjectMetadata: objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.id ===
        gqlFieldMorphRelation.morphRelation?.targetObjectMetadata.id,
    ),
    sourceObjectMetadata: objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.id ===
        gqlFieldMorphRelation.morphRelation?.sourceObjectMetadata.id,
    ),
  };
};
