import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type View } from '@/views/types/View';
import { getQueryVariablesFromFiltersAndSorts } from '@/views/utils/getQueryVariablesFromFiltersAndSorts';
import { mapViewFilterGroupsToRecordFilterGroups } from '@/views/utils/mapViewFilterGroupsToRecordFilterGroups';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { type RecordFilterValueDependencies } from 'twenty-shared/types';

export const computeScopedRelationArgs = ({
  scopeView,
  recordLimit,
  relationObjectMetadataItem,
  objectMetadataItems,
  fieldMetadataItems,
  filterValueDependencies,
}: {
  scopeView:
    | Pick<View, 'viewFilters' | 'viewFilterGroups' | 'viewSorts'>
    | undefined;
  recordLimit: number | null | undefined;
  relationObjectMetadataItem: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  fieldMetadataItems: FieldMetadataItem[];
  filterValueDependencies: RecordFilterValueDependencies;
}) => {
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

  return { filter, orderBy, first: recordLimit ?? undefined };
};
