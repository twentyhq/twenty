import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getImageIdentifierFieldMetadataItem } from '@/object-metadata/utils/getImageIdentifierFieldMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { type RecordGqlFields } from '@/object-record/graphql/record-gql-fields/types/RecordGqlFields';
import { generateActivityTargetGqlFields } from '@/object-record/graphql/record-gql-fields/utils/generateActivityTargetGqlFields';
import { generateJunctionRelationGqlFields } from '@/object-record/graphql/record-gql-fields/utils/generateJunctionRelationGqlFields';
import { isJunctionRelationField } from '@/object-record/record-field/ui/utils/junction/isJunctionRelationField';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { computeMorphRelationFieldName, isDefined } from 'twenty-shared/utils';

export type GenerateDepthRecordGqlFieldsFromFields = {
  objectMetadataItems: Pick<
    ObjectMetadataItem,
    | 'id'
    | 'fields'
    | 'labelIdentifierFieldMetadataId'
    | 'imageIdentifierFieldMetadataId'
    | 'nameSingular'
    | 'namePlural'
  >[];
  fields: Pick<
    FieldMetadataItem,
    'id' | 'name' | 'type' | 'settings' | 'morphRelations' | 'relation'
  >[];
  depth: 0 | 1;
  shouldOnlyLoadRelationIdentifiers?: boolean;
  isFilesFieldMigrated?: boolean;
};

export const generateDepthRecordGqlFieldsFromFields = ({
  objectMetadataItems,
  fields,
  depth,
  shouldOnlyLoadRelationIdentifiers = true,
  isFilesFieldMigrated,
}: GenerateDepthRecordGqlFieldsFromFields) => {
  const generatedRecordGqlFields: RecordGqlFields = fields.reduce(
    (recordGqlFields, fieldMetadata) => {
      const isMorphRelation =
        fieldMetadata.type === FieldMetadataType.MORPH_RELATION;

      const isRelation = fieldMetadata.type === FieldMetadataType.RELATION;

      const relationType = fieldMetadata.settings?.relationType;

      if (isRelation) {
        const targetObjectMetadataItem = objectMetadataItems.find(
          (objectMetadataItem) =>
            objectMetadataItem.id ===
            fieldMetadata.relation?.targetObjectMetadata.id,
        );

        if (!targetObjectMetadataItem) {
          throw new Error(
            `Target object metadata item not found for ${fieldMetadata.name}`,
          );
        }

        const isActivityTargetField =
          fieldMetadata.name === CoreObjectNamePlural.NoteTarget ||
          fieldMetadata.name === CoreObjectNamePlural.TaskTarget;

        if (isActivityTargetField && depth === 1) {
          const activityTargetObjectNameSingular =
            fieldMetadata.name === CoreObjectNamePlural.NoteTarget
              ? CoreObjectNameSingular.Note
              : CoreObjectNameSingular.Task;

          const activityTargetGqlFields = generateActivityTargetGqlFields({
            activityObjectNameSingular: activityTargetObjectNameSingular,
            objectMetadataItems,
            loadRelations: 'activity',
          });

          return {
            ...recordGqlFields,
            [fieldMetadata.name]: activityTargetGqlFields,
          };
        }

        if (isJunctionRelationField(fieldMetadata)) {
          const junctionGqlFields = generateJunctionRelationGqlFields({
            fieldMetadataItem: fieldMetadata,
            objectMetadataItems,
            isFilesFieldMigrated,
          });

          if (isDefined(junctionGqlFields) && depth === 1) {
            return {
              ...recordGqlFields,
              [fieldMetadata.name]: junctionGqlFields,
            };
          }
        }

        const labelIdentifierFieldMetadataItem =
          getLabelIdentifierFieldMetadataItem(targetObjectMetadataItem);

        const imageIdentifierFieldMetadataItem =
          getImageIdentifierFieldMetadataItem(
            targetObjectMetadataItem,
            isFilesFieldMigrated,
          );

        const relationIdentifierSubGqlFields = {
          id: true,
          ...(isDefined(labelIdentifierFieldMetadataItem)
            ? { [labelIdentifierFieldMetadataItem.name]: true }
            : {}),
          ...(isDefined(imageIdentifierFieldMetadataItem)
            ? { [imageIdentifierFieldMetadataItem.name]: true }
            : {}),
        };

        const manyToOneGqlFields = {
          [`${fieldMetadata.name}Id`]: true,
        };

        return {
          ...recordGqlFields,
          ...(depth === 1 && shouldOnlyLoadRelationIdentifiers
            ? { [fieldMetadata.name]: relationIdentifierSubGqlFields }
            : undefined),
          ...(depth === 1 && !shouldOnlyLoadRelationIdentifiers
            ? { [fieldMetadata.name]: true }
            : undefined),
          ...(relationType === RelationType.MANY_TO_ONE
            ? manyToOneGqlFields
            : undefined),
        };
      }

      if (isMorphRelation) {
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

        return {
          ...recordGqlFields,
          ...morphGqlFields.reduce(
            (morphGqlFields, morphGqlField) => ({
              ...morphGqlFields,
              ...(depth === 1
                ? { [`${morphGqlField.gqlField}`]: { id: true, name: true } }
                : {}),
              ...(relationType === RelationType.MANY_TO_ONE
                ? { [`${morphGqlField.gqlField}Id`]: true }
                : {}),
            }),
            {},
          ),
        };
      }

      return {
        ...recordGqlFields,
        [`${fieldMetadata.name}`]: true,
      };
    },
    {},
  );

  return generatedRecordGqlFields;
};
