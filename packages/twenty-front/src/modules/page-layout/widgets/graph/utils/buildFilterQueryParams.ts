import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
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
  objectMetadataItem: ObjectMetadataItem;
}): URLSearchParams => {
  const params = new URLSearchParams();

  const rootGroup = recordFilterGroups.find(
    (group) => !isDefined(group.parentRecordFilterGroupId),
  );

  if (isDefined(rootGroup)) {
    const urlFilterGroup = mapRecordFilterGroupToUrlFilterGroup({
      recordFilterGroupId: rootGroup.id,
      allRecordFilters: recordFilters,
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
  } else {
    const parentlessFilters = recordFilters.filter(
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
  }

  return params;
};
