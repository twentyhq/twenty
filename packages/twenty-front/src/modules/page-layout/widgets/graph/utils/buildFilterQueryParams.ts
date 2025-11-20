import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { isDefined } from 'twenty-shared/utils';
import { mapRecordFilterToUrlFilter } from './mapRecordFilterToUrlFilter';
import {
  mapRecordFilterGroupToUrlFilterGroup,
  type UrlFilterGroup,
} from './mapRecordFilterGroupToUrlFilterGroup';

const serializeNestedGroups = (
  groups: UrlFilterGroup[],
  prefix: string,
  params: URLSearchParams,
): void => {
  groups.forEach((group, groupIndex) => {
    const groupPrefix = `${prefix}[${groupIndex}]`;
    params.set(`${groupPrefix}[operator]`, group.operator);

    if (isDefined(group.filters)) {
      group.filters.forEach((filter, filterIndex) => {
        params.set(
          `${groupPrefix}[filters][${filterIndex}][field]`,
          filter.field,
        );
        params.set(`${groupPrefix}[filters][${filterIndex}][op]`, filter.op);
        params.set(
          `${groupPrefix}[filters][${filterIndex}][value]`,
          filter.value,
        );
        if (isDefined(filter.subField)) {
          params.set(
            `${groupPrefix}[filters][${filterIndex}][subField]`,
            filter.subField,
          );
        }
      });
    }

    if (isDefined(group.groups)) {
      serializeNestedGroups(group.groups, `${groupPrefix}[groups]`, params);
    }
  });
};

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
        urlFilterGroup.filters.forEach((filter, index) => {
          params.set(`filterGroup[filters][${index}][field]`, filter.field);
          params.set(`filterGroup[filters][${index}][op]`, filter.op);
          params.set(`filterGroup[filters][${index}][value]`, filter.value);
          if (isDefined(filter.subField)) {
            params.set(
              `filterGroup[filters][${index}][subField]`,
              filter.subField,
            );
          }
        });
      }

      if (isDefined(urlFilterGroup.groups)) {
        serializeNestedGroups(
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

    parentlessFilters.forEach((filter) => {
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
    });
  }

  return params;
};
