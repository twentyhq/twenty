import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isOneToManyRelationField } from '@/object-metadata/utils/isOneToManyRelationField';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { type ReadableRelationWithArguments } from '@/object-record/graphql/types/ReadableRelationWithArguments';
import { findRelationTargetObjectMetadataItem } from '@/related-record-paths/utils/findRelationTargetObjectMetadataItem';
import { doNotTranslate } from 'twenty-shared/i18n';
import {
  type ObjectRecordsPermissions,
  type RecordGqlFields,
} from 'twenty-shared/types';
import {
  canAccessThroughAllRecordsOrRlsPermission,
  capitalize,
  computeRelationWithArgumentsResponseKey,
  CustomError,
  isDefined,
  isRecordGqlFieldsRelationWithArguments,
} from 'twenty-shared/utils';

export const getReadableRelationsWithArguments = ({
  objectMetadataItem,
  objectMetadataItems,
  recordGqlFields,
  objectPermissionsByObjectMetadataId,
}: {
  objectMetadataItem: Pick<EnrichedObjectMetadataItem, 'readableFields'>;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  recordGqlFields?: RecordGqlFields;
  objectPermissionsByObjectMetadataId: Record<string, ObjectRecordsPermissions>;
}): ReadableRelationWithArguments[] =>
  Object.entries(recordGqlFields ?? {}).flatMap(
    ([responseKey, relationWithArguments]) => {
      if (!isRecordGqlFieldsRelationWithArguments(relationWithArguments)) {
        return [];
      }

      // Readers find the value under the derived key, so any other key would hide it from them
      if (
        responseKey !==
        computeRelationWithArgumentsResponseKey(relationWithArguments)
      ) {
        throw new CustomError(
          doNotTranslate(
            `Relation with arguments "${relationWithArguments.relationFieldName}" must be keyed by computeRelationWithArgumentsResponseKey, got "${responseKey}"`,
          ),
          'RELATION_WITH_ARGUMENTS_INVALID_RESPONSE_KEY',
        );
      }

      const relationFieldMetadataItem = objectMetadataItem.readableFields.find(
        (fieldMetadataItem) =>
          fieldMetadataItem.isActive &&
          fieldMetadataItem.name === relationWithArguments.relationFieldName,
      );

      // The server only takes arguments on one-to-many relations
      if (
        !isDefined(relationFieldMetadataItem) ||
        !isOneToManyRelationField(relationFieldMetadataItem)
      ) {
        return [];
      }

      const relationObjectMetadataItem = findRelationTargetObjectMetadataItem({
        fieldMetadataItem: relationFieldMetadataItem,
        objectMetadataItems,
      });

      if (
        !isDefined(relationObjectMetadataItem) ||
        !canAccessThroughAllRecordsOrRlsPermission({
          objectRecordsPermissions: getObjectPermissionsForObject(
            objectPermissionsByObjectMetadataId,
            relationObjectMetadataItem.id,
          ),
          operationType: 'read',
        })
      ) {
        return [];
      }

      const {
        relationFieldName,
        filter,
        orderBy,
        first,
        aggregateGqlFieldNames = [],
        recordGqlFields,
      } = relationWithArguments;
      const typeName = capitalize(relationObjectMetadataItem.nameSingular);
      const filterVariableName = doNotTranslate(`${responseKey}Filter`);
      const orderByVariableName = doNotTranslate(`${responseKey}OrderBy`);
      const firstVariableName = doNotTranslate(`${responseKey}First`);

      return [
        {
          fieldMetadataItem: relationFieldMetadataItem,
          recordGqlFields,
          selectionHead: doNotTranslate(
            `${responseKey}: ${relationFieldName}(filter: $${filterVariableName}, orderBy: $${orderByVariableName}, first: $${firstVariableName})`,
          ),
          connectionGqlFieldNames: aggregateGqlFieldNames,
          // Arguments go in as variables because some filter values are enums, which inline JSON cannot express
          variableDefinitions: doNotTranslate(
            `, $${filterVariableName}: ${typeName}FilterInput, $${orderByVariableName}: [${typeName}OrderByInput], $${firstVariableName}: Int`,
          ),
          variables: {
            [filterVariableName]: filter,
            [orderByVariableName]: orderBy,
            [firstVariableName]: first,
          },
        },
      ];
    },
  );
