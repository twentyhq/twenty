import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { type ReadableRelationWithArguments } from '@/object-record/graphql/types/ReadableRelationWithArguments';
import { doNotTranslate } from 'twenty-shared/i18n';
import {
  FieldMetadataType,
  type ObjectRecordsPermissions,
  type RecordGqlFields,
  RelationType,
} from 'twenty-shared/types';
import {
  canAccessThroughAllRecordsOrRlsPermission,
  computeRelationWithArgumentsResponseKey,
  isDefined,
  isRecordGqlFieldsRelationWithArguments,
} from 'twenty-shared/utils';

// The single rule for which relations with arguments a query selects: its selections, variable definitions and
// variables are all built from this list, so they cannot disagree. Only the root of recordGqlFields is considered.
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

      // Optimistic effects find the record key from the cached arguments, which only works for the derived key
      if (
        responseKey !==
        computeRelationWithArgumentsResponseKey(relationWithArguments)
      ) {
        throw new Error(
          doNotTranslate(
            `Relation with arguments "${relationWithArguments.relationFieldName}" must be keyed by computeRelationWithArgumentsResponseKey, got "${responseKey}"`,
          ),
        );
      }

      const relationFieldMetadataItem = objectMetadataItem.readableFields.find(
        (fieldMetadataItem) =>
          fieldMetadataItem.isActive &&
          fieldMetadataItem.name === relationWithArguments.relationFieldName,
      );

      // The server only takes arguments on one-to-many relations
      if (
        relationFieldMetadataItem?.type !== FieldMetadataType.RELATION ||
        relationFieldMetadataItem.relation?.type !== RelationType.ONE_TO_MANY
      ) {
        return [];
      }

      const relationObjectMetadataItem = objectMetadataItems.find(
        ({ id }) =>
          id === relationFieldMetadataItem.relation?.targetObjectMetadata.id,
      );

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

      return [
        {
          responseKey,
          relationWithArguments,
          relationFieldMetadataItem,
          relationObjectMetadataItem,
        },
      ];
    },
  );
