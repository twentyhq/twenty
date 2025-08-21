import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { mapFieldMetadataToGraphQLQuery } from '@/object-metadata/utils/mapFieldMetadataToGraphQLQuery';
import { shouldFieldBeQueried } from '@/object-metadata/utils/shouldFieldBeQueried';
import { type RecordGqlFields } from '@/object-record/graphql/types/RecordGqlFields';
import { isRecordGqlFieldsNode } from '@/object-record/graphql/utils/isRecordGraphlFieldsNode';
import { FieldMetadataType, type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type MapObjectMetadataToGraphQLQueryArgs = {
  objectMetadataItems: ObjectMetadataItem[];
  objectMetadataItem: Pick<
    ObjectMetadataItem,
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
    .filter((field) => field.type === FieldMetadataType.RELATION)
    .filter((field) => isDefined(field.settings?.joinColumnName));

  const manyToOneRelationGqlFieldWithFieldMetadata =
    manyToOneRelationFields.map((field) => ({
      gqlField: field.settings?.joinColumnName,
      fieldMetadata: field,
    }));

  const gqlFieldWithFieldMetadataThatCouldBeQueried = [
    ...objectMetadataItem.readableFields
      .filter((fieldMetadata) => fieldMetadata.isActive)
      .map((fieldMetadata) => ({
        gqlField: fieldMetadata.name,
        fieldMetadata,
      })),
    ...manyToOneRelationGqlFieldWithFieldMetadata,
  ].sort((gqlFieldWithFieldMetadataA, gqlFieldWithFieldMetadataB) =>
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
