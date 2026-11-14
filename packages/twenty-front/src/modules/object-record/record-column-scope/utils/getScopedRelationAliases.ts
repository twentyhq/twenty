import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectPermissionsByObjectMetadataId } from '@/object-metadata/types/ObjectPermissionsByObjectMetadataId';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { type RecordGqlRelationAlias } from '@/object-record/graphql/types/RecordGqlRelationAlias';
import { computeScopedRelationArgs } from '@/object-record/record-column-scope/utils/computeScopedRelationArgs';
import { getScopedRelationAlias } from '@/object-record/record-column-scope/utils/getScopedRelationAlias';
import { isScopedRelationColumn } from '@/object-record/record-column-scope/utils/isScopedRelationColumn';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { findRelationTargetObjectMetadataItem } from '@/related-record-paths/utils/findRelationTargetObjectMetadataItem';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';
import { type RecordFilterValueDependencies } from 'twenty-shared/types';
import {
  canAccessThroughAllRecordsOrRlsPermission,
  isDefined,
} from 'twenty-shared/utils';

export const getScopedRelationAliases = ({
  recordFields,
  fieldMetadataItemByFieldMetadataItemId,
  scopeViewsByOwnerViewFieldIdMap,
  objectMetadataItems,
  fieldMetadataItems,
  filterValueDependencies,
  objectPermissionsByObjectMetadataId,
}: {
  recordFields: Pick<RecordField, 'id' | 'fieldMetadataItemId' | 'settings'>[];
  fieldMetadataItemByFieldMetadataItemId: Record<string, FieldMetadataItem>;
  scopeViewsByOwnerViewFieldIdMap: Map<string, ViewWithRelations>;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  fieldMetadataItems: FieldMetadataItem[];
  filterValueDependencies: RecordFilterValueDependencies;
  objectPermissionsByObjectMetadataId: ObjectPermissionsByObjectMetadataId;
}): RecordGqlRelationAlias[] =>
  recordFields.flatMap((recordField) => {
    const fieldMetadataItem =
      fieldMetadataItemByFieldMetadataItemId[recordField.fieldMetadataItemId];
    const scopeView = scopeViewsByOwnerViewFieldIdMap.get(recordField.id);

    if (
      !isDefined(fieldMetadataItem) ||
      !isScopedRelationColumn({ fieldMetadataItem, recordField, scopeView })
    ) {
      return [];
    }

    const relationObjectMetadataItem = findRelationTargetObjectMetadataItem({
      fieldMetadataItem,
      objectMetadataItems,
    });

    // An alias on an unreadable object would have no selection set and fail the whole query
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
        alias: getScopedRelationAlias(recordField.id),
        fieldName: fieldMetadataItem.name,
        relationObjectMetadataItem,
        ...computeScopedRelationArgs({
          scopeView,
          recordLimit: recordField.settings?.recordLimit,
          relationObjectMetadataItem,
          objectMetadataItems,
          fieldMetadataItems,
          filterValueDependencies,
        }),
      },
    ];
  });
