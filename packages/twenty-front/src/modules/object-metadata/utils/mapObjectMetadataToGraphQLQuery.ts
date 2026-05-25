import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { mapFieldMetadataToGraphQLQuery } from '@/object-metadata/utils/mapFieldMetadataToGraphQLQuery';
import { shouldFieldBeQueried } from '@/object-metadata/utils/shouldFieldBeQueried';
import { type RecordGqlFields } from '@/object-record/graphql/record-gql-fields/types/RecordGqlFields';
import { isRecordGqlFieldsNode } from '@/object-record/graphql/utils/isRecordGraphlFieldsNode';
import {
  FieldMetadataType,
  RelationType,
  type ObjectPermissions,
} from 'twenty-shared/types';
import {
  computeMorphRelationGqlFieldJoinColumnName,
  computeMorphRelationGqlFieldName,
  computeRelationGqlFieldJoinColumnName,
  isDefined,
} from 'twenty-shared/utils';

type MapObjectMetadataToGraphQLQueryArgs = {
  objectMetadataItems: EnrichedObjectMetadataItem[];
  objectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'nameSingular' | 'fields' | 'id' | 'readableFields'
  >;
  recordGqlFields?: RecordGqlFields;
  computeReferences?: boolean;
  isRootLevel?: boolean;
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >;
};

export const mapObjectMetadataToGraphQLQuery = ({
  objectMetadataItems,
  objectMetadataItem,
  recordGqlFields,
  computeReferences = false,
  isRootLevel = true,
  objectPermissionsByObjectMetadataId,
}: MapObjectMetadataToGraphQLQueryArgs): string => {
  if (
    !isRootLevel &&
    isDefined(objectPermissionsByObjectMetadataId) &&
    isDefined(objectMetadataItem.id)
  ) {
    const objectPermission = getObjectPermissionsForObject(
      objectPermissionsByObjectMetadataId,
      objectMetadataItem.id,
    );
    if (!objectPermission.canReadObjectRecords) {
      return '';
    }
  }

  const manyToOneRelationFields = objectMetadataItem?.readableFields
    .filter((field) => field.isActive)
    .filter((field) => {
      if (field.type === FieldMetadataType.RELATION) {
        return field.relation?.type === RelationType.MANY_TO_ONE;
      }
      if (field.type === FieldMetadataType.MORPH_RELATION) {
        return field.settings?.relationType === RelationType.MANY_TO_ONE;
      }
      return false;
    });

  const manyToOneRelationGqlFieldWithFieldMetadata =
    manyToOneRelationFields.flatMap((fieldMetadata) => {
      const isMorphRelation =
        fieldMetadata.type === FieldMetadataType.MORPH_RELATION;
      if (!isMorphRelation) {
        return {
          gqlField: computeRelationGqlFieldJoinColumnName({
            name: fieldMetadata.name,
          }),
          fieldMetadata: fieldMetadata,
        };
      }

      if (!isDefined(fieldMetadata.morphRelations)) {
        return [];
      }

      return fieldMetadata.morphRelations.map((morphRelation) => ({
        gqlField: computeMorphRelationGqlFieldJoinColumnName({
          fieldName: fieldMetadata.name,
          relationType: morphRelation.type,
          targetObjectMetadataNameSingular:
            morphRelation.targetObjectMetadata.nameSingular,
          targetObjectMetadataNamePlural:
            morphRelation.targetObjectMetadata.namePlural,
        }),
        fieldMetadata: fieldMetadata,
      }));
    });

  const readableFields = objectMetadataItem.readableFields.filter(
    (fieldMetadata) => fieldMetadata.isActive,
  );

  const activeReadableFields = readableFields.flatMap((fieldMetadata) => {
    const isMorphRelation =
      fieldMetadata.type === FieldMetadataType.MORPH_RELATION;
    if (!isMorphRelation) {
      return [
        {
          gqlField: fieldMetadata.name,
          fieldMetadata,
        },
      ];
    }

    if (!isDefined(fieldMetadata.morphRelations)) {
      return [];
    }

    return fieldMetadata.morphRelations.map((morphRelation) => ({
      gqlField: computeMorphRelationGqlFieldName({
        fieldName: fieldMetadata.name,
        relationType: morphRelation.type,
        targetObjectMetadataNameSingular:
          morphRelation.targetObjectMetadata.nameSingular,
        targetObjectMetadataNamePlural:
          morphRelation.targetObjectMetadata.namePlural,
      }),
      fieldMetadata,
    }));
  });

  const gqlFieldsWithFieldMetadata = [
    ...activeReadableFields,
    ...manyToOneRelationGqlFieldWithFieldMetadata,
  ];

  const gqlFieldWithFieldMetadataThatCouldBeQueried =
    gqlFieldsWithFieldMetadata.sort(
      (gqlFieldWithFieldMetadataA, gqlFieldWithFieldMetadataB) =>
        gqlFieldWithFieldMetadataA.gqlField.localeCompare(
          gqlFieldWithFieldMetadataB.gqlField,
        ),
    );

  const gqlFieldWithFieldMetadataThatSouldBeQueried =
    gqlFieldWithFieldMetadataThatCouldBeQueried.filter(
      (gqlFieldWithFieldMetadata) =>
        shouldFieldBeQueried({
          gqlField: gqlFieldWithFieldMetadata.gqlField,
          fieldMetadata: gqlFieldWithFieldMetadata.fieldMetadata,
          recordGqlFields,
        }),
    );

  if (!isRootLevel && computeReferences) {
    return `{
      __ref
    }`;
  }
  const mappedFields = gqlFieldWithFieldMetadataThatSouldBeQueried
    .map((gqlFieldWithFieldMetadata) => {
      const currentRecordGqlFields =
        recordGqlFields?.[gqlFieldWithFieldMetadata.gqlField];
      const relationRecordGqlFields = isRecordGqlFieldsNode(
        currentRecordGqlFields,
      )
        ? currentRecordGqlFields
        : undefined;
      return mapFieldMetadataToGraphQLQuery({
        objectMetadataItems,
        gqlField: gqlFieldWithFieldMetadata.gqlField,
        fieldMetadata: gqlFieldWithFieldMetadata.fieldMetadata,
        relationRecordGqlFields,
        computeReferences,
        objectPermissionsByObjectMetadataId,
      });
    })
    .filter((field) => field !== '')
    .join('\n');

  return `{
__typename
${mappedFields}
}`;
};
