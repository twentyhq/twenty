import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectPermissionsByObjectMetadataId } from '@/object-metadata/types/ObjectPermissionsByObjectMetadataId';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { type ScopedRelationAlias } from '@/object-record/record-column-scope/types/ScopedRelationAlias';
import { isScopedRelationColumn } from '@/object-record/record-column-scope/utils/isScopedRelationColumn';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { findRelationTargetObjectMetadataItem } from '@/related-record-paths/utils/findRelationTargetObjectMetadataItem';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';
import { getQueryVariablesFromFiltersAndSorts } from '@/views/utils/getQueryVariablesFromFiltersAndSorts';
import { mapViewFilterGroupsToRecordFilterGroups } from '@/views/utils/mapViewFilterGroupsToRecordFilterGroups';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
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
  scopeViewsByOwnerViewFieldIdMap: Map<
    string,
    Pick<
      ViewWithRelations,
      'id' | 'viewFilters' | 'viewFilterGroups' | 'viewSorts'
    >
  >;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  fieldMetadataItems: FieldMetadataItem[];
  filterValueDependencies: RecordFilterValueDependencies;
  objectPermissionsByObjectMetadataId: ObjectPermissionsByObjectMetadataId;
}): ScopedRelationAlias[] =>
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

    const { filter, orderBy } = getQueryVariablesFromFiltersAndSorts({
      recordFilterGroups: mapViewFilterGroupsToRecordFilterGroups(
        scopeView?.viewFilterGroups ?? [],
      ),
      recordFilters: mapViewFiltersToFilters(
        scopeView?.viewFilters ?? [],
        fieldMetadataItems,
      ),
      recordSorts: (scopeView?.viewSorts ?? []).map(
        ({ viewId: _viewId, ...recordSort }) => recordSort,
      ),
      objectMetadataItem: relationObjectMetadataItem,
      objectMetadataItems,
      fieldMetadataItems,
      filterValueDependencies,
    });

    return [
      {
        ownerViewFieldId: recordField.id,
        alias: `scope_${recordField.id.replaceAll('-', '')}`,
        fieldName: fieldMetadataItem.name,
        relationObjectMetadataItem,
        filter,
        orderBy,
        first: recordField.settings?.recordLimit ?? undefined,
      },
    ];
  });
