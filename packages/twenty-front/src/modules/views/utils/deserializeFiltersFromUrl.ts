import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { isNonEmptyString } from '@sniptt/guards';
import {
  type RecordFilterGroupLogicalOperator,
  type ViewFilterOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

type UrlFilter = {
  field: string;
  op: ViewFilterOperand;
  value: string;
  subField?: string;
};

type UrlFilterGroup = {
  operator: RecordFilterGroupLogicalOperator;
  filters?: UrlFilter[];
  groups?: UrlFilterGroup[];
};

type DeserializationResult = {
  recordFilters: RecordFilter[];
  recordFilterGroups: RecordFilterGroup[];
};

/**
 * Converts a URL filter to a RecordFilter
 */
const convertUrlFilterToRecordFilter = ({
  urlFilter,
  objectMetadataItem,
  recordFilterGroupId,
  positionInGroup,
}: {
  urlFilter: UrlFilter;
  objectMetadataItem: ObjectMetadataItem;
  recordFilterGroupId?: string;
  positionInGroup: number;
}): RecordFilter | null => {
  const fieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.name === urlFilter.field,
  );

  if (!isDefined(fieldMetadataItem)) {
    return null;
  }

  const recordFilter: RecordFilter = {
    id: uuidv4(),
    fieldMetadataId: fieldMetadataItem.id,
    value: urlFilter.value,
    displayValue: urlFilter.value,
    type: fieldMetadataItem.type as RecordFilter['type'],
    operand: urlFilter.op,
    label: fieldMetadataItem.label,
    positionInRecordFilterGroup: positionInGroup,
  };

  if (isDefined(recordFilterGroupId)) {
    recordFilter.recordFilterGroupId = recordFilterGroupId;
  }

  if (isNonEmptyString(urlFilter.subField)) {
    recordFilter.subFieldName = urlFilter.subField as RecordFilter['subFieldName'];
  }

  return recordFilter;
};

/**
 * Recursively deserializes URL filter group hierarchy into RecordFilterGroups and RecordFilters
 */
const deserializeUrlFilterGroup = ({
  urlFilterGroup,
  objectMetadataItem,
  parentGroupId,
  positionInParent,
}: {
  urlFilterGroup: UrlFilterGroup;
  objectMetadataItem: ObjectMetadataItem;
  parentGroupId?: string;
  positionInParent: number;
}): DeserializationResult => {
  const groupId = uuidv4();
  const recordFilters: RecordFilter[] = [];
  const recordFilterGroups: RecordFilterGroup[] = [];

  // Create the current group
  const currentGroup: RecordFilterGroup = {
    id: groupId,
    logicalOperator: urlFilterGroup.operator,
    positionInRecordFilterGroup: positionInParent,
  };

  if (isDefined(parentGroupId)) {
    currentGroup.parentRecordFilterGroupId = parentGroupId;
  }

  recordFilterGroups.push(currentGroup);

  let positionCounter = 0;

  // Deserialize filters in this group
  if (isDefined(urlFilterGroup.filters)) {
    urlFilterGroup.filters.forEach((urlFilter) => {
      const recordFilter = convertUrlFilterToRecordFilter({
        urlFilter,
        objectMetadataItem,
        recordFilterGroupId: groupId,
        positionInGroup: positionCounter++,
      });

      if (isDefined(recordFilter)) {
        recordFilters.push(recordFilter);
      }
    });
  }

  // Recursively deserialize child groups
  if (isDefined(urlFilterGroup.groups)) {
    urlFilterGroup.groups.forEach((childUrlGroup) => {
      const childResult = deserializeUrlFilterGroup({
        urlFilterGroup: childUrlGroup,
        objectMetadataItem,
        parentGroupId: groupId,
        positionInParent: positionCounter++,
      });

      recordFilters.push(...childResult.recordFilters);
      recordFilterGroups.push(...childResult.recordFilterGroups);
    });
  }

  return {
    recordFilters,
    recordFilterGroups,
  };
};

/**
 * Parses filter group from URL query params into RecordFilterGroups and RecordFilters
 */
export const parseFilterGroupFromUrl = ({
  urlFilterGroup,
  objectMetadataItem,
}: {
  urlFilterGroup: UrlFilterGroup;
  objectMetadataItem: ObjectMetadataItem;
}): DeserializationResult => {
  const result = deserializeUrlFilterGroup({
    urlFilterGroup,
    objectMetadataItem,
    positionInParent: 0,
  });

  // eslint-disable-next-line no-console
  console.log(
    '[Filter Deserialization] Parsed from URL:',
    JSON.stringify({
      filterCount: result.recordFilters.length,
      groupCount: result.recordFilterGroups.length,
      recordFilters: result.recordFilters,
      recordFilterGroups: result.recordFilterGroups,
    }),
  );

  return result;
};
