import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { isDefined } from 'twenty-shared/utils';
import { appendNestedUrlFilterGroupsToQueryParams } from './appendNestedUrlFilterGroupsToQueryParams';
import { mapRecordFilterToUrlFilter } from './mapRecordFilterToUrlFilter';
import { mapRecordFilterGroupToUrlFilterGroup } from './mapRecordFilterGroupToUrlFilterGroup';

export const buildFilterQueryParams = ({
  recordFilters = [],
  recordFilterGroups = [],
  objectMetadataItem,
}: {
  recordFilters?: RecordFilter[];
  recordFilterGroups?: RecordFilterGroup[];
  objectMetadataItem: EnrichedObjectMetadataItem;
}): URLSearchParams => {
  const params = new URLSearchParams();

  // The view URL format names a field and an operand only; a filter that traverses a relation to a target
  // field cannot be expressed in it, so it is left out of both the group and the root params.
  const urlExpressibleRecordFilters = recordFilters.filter(
    (filter) => !isDefined(filter.relationTargetFieldMetadataId),
  );

  const rootGroup = recordFilterGroups.find(
    (group) => !isDefined(group.parentRecordFilterGroupId),
  );

  if (isDefined(rootGroup)) {
    const urlFilterGroup = mapRecordFilterGroupToUrlFilterGroup({
      recordFilterGroupId: rootGroup.id,
      allRecordFilters: urlExpressibleRecordFilters,
      allRecordFilterGroups: recordFilterGroups,
      objectMetadataItem,
    });

    if (isDefined(urlFilterGroup)) {
      params.set('filterGroup[operator]', urlFilterGroup.operator);

      if (isDefined(urlFilterGroup.filters)) {
        for (const [index, filter] of urlFilterGroup.filters.entries()) {
          params.set(`filterGroup[filters][${index}][field]`, filter.field);
          params.set(`filterGroup[filters][${index}][op]`, filter.op);
          params.set(`filterGroup[filters][${index}][value]`, filter.value);
          if (isDefined(filter.subField)) {
            params.set(
              `filterGroup[filters][${index}][subField]`,
              filter.subField,
            );
          }
        }
      }

      if (isDefined(urlFilterGroup.groups)) {
        appendNestedUrlFilterGroupsToQueryParams(
          urlFilterGroup.groups,
          'filterGroup[groups]',
          params,
        );
      }
    }
  }

  // Parentless filters (merged dashboard filters among them) are ANDed with the group by the records view,
  // the same way computeRecordGqlOperationFilter combines them for the chart.
  const parentlessFilters = urlExpressibleRecordFilters.filter(
    (filter) => !isDefined(filter.recordFilterGroupId),
  );

  for (const filter of parentlessFilters) {
    const urlFilter = mapRecordFilterToUrlFilter({
      recordFilter: filter,
      objectMetadataItem,
    });

    if (isDefined(urlFilter)) {
      const fieldName = isDefined(urlFilter.subField)
        ? `${urlFilter.field}.${urlFilter.subField}`
        : urlFilter.field;

      params.append(`filter[${fieldName}][${urlFilter.op}]`, urlFilter.value);
    }
  }

  return params;
};
