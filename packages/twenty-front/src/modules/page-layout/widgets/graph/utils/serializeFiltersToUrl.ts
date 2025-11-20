import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

type UrlFilter = {
  field: string;
  op: string;
  value: string;
  subField?: string;
};

type UrlFilterGroup = {
  operator: string;
  filters?: UrlFilter[];
  groups?: UrlFilterGroup[];
};

/**
 * Converts a RecordFilter to a URL-friendly filter object
 */
export const convertRecordFilterToUrlFilter = ({
  recordFilter,
  objectMetadataItem,
}: {
  recordFilter: RecordFilter;
  objectMetadataItem: ObjectMetadataItem;
}): UrlFilter | null => {
  const fieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === recordFilter.fieldMetadataId,
  );

  if (!isDefined(fieldMetadataItem)) {
    return null;
  }

  const urlFilter: UrlFilter = {
    field: fieldMetadataItem.name,
    op: recordFilter.operand,
    value: recordFilter.value,
  };

  if (isNonEmptyString(recordFilter.subFieldName)) {
    urlFilter.subField = recordFilter.subFieldName;
  }

  return urlFilter;
};

/**
 * Recursively serializes a RecordFilterGroup and its children to URL-friendly structure
 */
export const serializeRecordFilterGroupToUrl = ({
  recordFilterGroupId,
  allRecordFilters,
  allRecordFilterGroups,
  objectMetadataItem,
}: {
  recordFilterGroupId: string;
  allRecordFilters: RecordFilter[];
  allRecordFilterGroups: RecordFilterGroup[];
  objectMetadataItem: ObjectMetadataItem;
}): UrlFilterGroup | null => {
  const currentGroup = allRecordFilterGroups.find(
    (group) => group.id === recordFilterGroupId,
  );

  if (!isDefined(currentGroup)) {
    return null;
  }

  const urlFilterGroup: UrlFilterGroup = {
    operator: currentGroup.logicalOperator,
  };

  // Get filters that belong to this group
  const filtersInGroup = allRecordFilters
    .filter((filter) => filter.recordFilterGroupId === recordFilterGroupId)
    .sort(
      (a, b) =>
        (a.positionInRecordFilterGroup ?? 0) -
        (b.positionInRecordFilterGroup ?? 0),
    );

  if (filtersInGroup.length > 0) {
    const urlFilters = filtersInGroup
      .map((filter) =>
        convertRecordFilterToUrlFilter({
          recordFilter: filter,
          objectMetadataItem,
        }),
      )
      .filter(isDefined);

    if (urlFilters.length > 0) {
      urlFilterGroup.filters = urlFilters;
    }
  }

  // Get child groups (nested groups)
  const childGroups = allRecordFilterGroups
    .filter((group) => group.parentRecordFilterGroupId === recordFilterGroupId)
    .sort(
      (a, b) =>
        (a.positionInRecordFilterGroup ?? 0) -
        (b.positionInRecordFilterGroup ?? 0),
    );

  if (childGroups.length > 0) {
    const urlChildGroups = childGroups
      .map((childGroup) =>
        serializeRecordFilterGroupToUrl({
          recordFilterGroupId: childGroup.id,
          allRecordFilters,
          allRecordFilterGroups,
          objectMetadataItem,
        }),
      )
      .filter(isDefined);

    if (urlChildGroups.length > 0) {
      urlFilterGroup.groups = urlChildGroups;
    }
  }

  return urlFilterGroup;
};

/**
 * Builds URL query parameters from chart filters (recordFilters + recordFilterGroups)
 */
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

  // Find root group (no parent)
  const rootGroup = recordFilterGroups.find(
    (group) => !isDefined(group.parentRecordFilterGroupId),
  );

  if (isDefined(rootGroup)) {
    // Serialize the entire filter group hierarchy
    const urlFilterGroup = serializeRecordFilterGroupToUrl({
      recordFilterGroupId: rootGroup.id,
      allRecordFilters: recordFilters,
      allRecordFilterGroups: recordFilterGroups,
      objectMetadataItem,
    });

    if (isDefined(urlFilterGroup)) {
      // Use qs-style nested param encoding
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
    // No groups - serialize parentless filters as simple filters
    const parentlessFilters = recordFilters.filter(
      (filter) => !isDefined(filter.recordFilterGroupId),
    );

    parentlessFilters.forEach((filter) => {
      const urlFilter = convertRecordFilterToUrlFilter({
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

  // eslint-disable-next-line no-console
  console.log(
    '[Filter Serialization] URL params generated:',
    JSON.stringify({
      paramsString: params.toString(),
      hasFilterGroups: recordFilterGroups.length > 0,
      filterCount: recordFilters.length,
      groupCount: recordFilterGroups.length,
    }),
  );

  return params;
};

/**
 * Helper to serialize nested groups recursively into URL params
 */
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
