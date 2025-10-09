import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordGqlFields } from '@/object-record/graphql/types/RecordGqlFields';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { computeMorphRelationFieldName, isDefined } from 'twenty-shared/utils';

export type GenerateDepthOneRecordGqlFields = {
  objectMetadataItem: ObjectMetadataItem;
};

export const generateDepthOneRecordGqlFields = ({
  objectMetadataItem,
}: GenerateDepthOneRecordGqlFields) => {
  const gqlFields = objectMetadataItem.readableFields.flatMap(
    (fieldMetadata) => {
      const isManyToOneMorphRelation =
        fieldMetadata.type === FieldMetadataType.MORPH_RELATION &&
        fieldMetadata.settings.relationType === RelationType.MANY_TO_ONE;

      const isManyToOneRelation =
        fieldMetadata.type === FieldMetadataType.RELATION &&
        fieldMetadata.settings.relationType === RelationType.MANY_TO_ONE;

      const isOneToManyMorphRelation =
        fieldMetadata.type === FieldMetadataType.MORPH_RELATION &&
        fieldMetadata.settings.relationType === RelationType.ONE_TO_MANY;

      if (isManyToOneRelation) {
        return [`${fieldMetadata.name}Id`, `${fieldMetadata.name}`];
      }

      if (isManyToOneMorphRelation) {
        if (!isDefined(fieldMetadata.morphRelations)) {
          throw new Error(
            `Field ${fieldMetadata.name} is missing, please refresh the page. If the problem persists, please contact support.`,
          );
        }

        const morphGqlFields = fieldMetadata.morphRelations.map(
          (morphRelation) => ({
            gqlField: computeMorphRelationFieldName({
              fieldName: fieldMetadata.name,
              relationType: morphRelation.type,
              targetObjectMetadataNameSingular:
                morphRelation.targetObjectMetadata.nameSingular,
              targetObjectMetadataNamePlural:
                morphRelation.targetObjectMetadata.namePlural,
            }),
            fieldMetadata,
          }),
        );
        return morphGqlFields.flatMap((morphGqlField) => [
          morphGqlField.gqlField,
          `${morphGqlField.gqlField}Id`,
        ]);
      }

      if (isOneToManyMorphRelation) {
        if (!isDefined(fieldMetadata.morphRelations)) {
          throw new Error(
            `Field ${fieldMetadata.name} is missing, please refresh the page. If the problem persists, please contact support.`,
          );
        }

        const morphGqlFields = fieldMetadata.morphRelations.map(
          (morphRelation) => ({
            gqlField: computeMorphRelationFieldName({
              fieldName: fieldMetadata.name,
              relationType: morphRelation.type,
              targetObjectMetadataNameSingular:
                morphRelation.targetObjectMetadata.nameSingular,
              targetObjectMetadataNamePlural:
                morphRelation.targetObjectMetadata.namePlural,
            }),
            fieldMetadata,
          }),
        );
        return morphGqlFields.flatMap((morphGqlField) => [
          morphGqlField.gqlField,
        ]);
      }

      return [fieldMetadata.name];
    },
  );

  return gqlFields.reduce<RecordGqlFields>((acc, field) => {
    return {
      ...acc,
      [field]:
      // TODO: Remove once we have made the workflows lighter
        (objectMetadataItem.nameSingular === CoreObjectNameSingular.Workflow ||
          objectMetadataItem.nameSingular ===
            CoreObjectNameSingular.WorkflowVersion ||
          objectMetadataItem.nameSingular ===
            CoreObjectNameSingular.WorkflowRun) &&
        (field === 'versions' || field === 'runs')
          ? { id: true, name: true }
          : true,
    };
  }, {});
};
