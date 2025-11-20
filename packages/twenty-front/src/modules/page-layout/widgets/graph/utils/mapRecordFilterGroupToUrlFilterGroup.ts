import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { isDefined } from 'twenty-shared/utils';
import {
  mapRecordFilterToUrlFilter,
  type UrlFilter,
} from './mapRecordFilterToUrlFilter';

export type UrlFilterGroup = {
  operator: string;
  filters?: UrlFilter[];
  groups?: UrlFilterGroup[];
};

export const mapRecordFilterGroupToUrlFilterGroup = ({
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
        mapRecordFilterToUrlFilter({
          recordFilter: filter,
          objectMetadataItem,
        }),
      )
      .filter(isDefined);

    if (urlFilters.length > 0) {
      urlFilterGroup.filters = urlFilters;
    }
  }

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
        mapRecordFilterGroupToUrlFilterGroup({
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
