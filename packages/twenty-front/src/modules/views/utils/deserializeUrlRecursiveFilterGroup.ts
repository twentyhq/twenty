import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type UrlFilterDeserializationResult } from '@/views/types/UrlFilterDeserializationResult';
import { type UrlRecursiveFilterGroup } from '@/views/types/UrlRecursiveFilterGroup';
import { convertUrlSingleFilterToRecordFilter } from '@/views/utils/convertUrlSingleFilterToRecordFilter';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

export const deserializeUrlRecursiveFilterGroup = ({
  urlRecursiveFilterGroup,
  objectMetadataItem,
  parentGroupId,
  positionInParent,
}: {
  urlRecursiveFilterGroup: UrlRecursiveFilterGroup;
  objectMetadataItem: ObjectMetadataItem;
  parentGroupId?: string;
  positionInParent: number;
}): UrlFilterDeserializationResult => {
  const groupId = uuidv4();
  const recordFilters: RecordFilter[] = [];
  const recordFilterGroups: RecordFilterGroup[] = [];
  const groupFilters: RecordFilter[] = [];

  let positionCounter = 0;

  if (isDefined(urlRecursiveFilterGroup.filters)) {
    for (const urlSingleFilter of urlRecursiveFilterGroup.filters) {
      const recordFilter = convertUrlSingleFilterToRecordFilter({
        urlSingleFilter,
        objectMetadataItem,
        recordFilterGroupId: groupId,
        positionInGroup: positionCounter++,
      });

      if (isDefined(recordFilter)) {
        groupFilters.push(recordFilter);
        recordFilters.push(recordFilter);
      }
    }
  }

  const childGroupResults: RecordFilterGroup[] = [];
  if (isDefined(urlRecursiveFilterGroup.groups)) {
    for (const childUrlGroup of urlRecursiveFilterGroup.groups) {
      const childResult = deserializeUrlRecursiveFilterGroup({
        urlRecursiveFilterGroup: childUrlGroup,
        objectMetadataItem,
        parentGroupId: groupId,
        positionInParent: positionCounter++,
      });

      if (
        childResult.recordFilters.length > 0 ||
        childResult.recordFilterGroups.length > 0
      ) {
        recordFilters.push(...childResult.recordFilters);
        childGroupResults.push(...childResult.recordFilterGroups);
        recordFilterGroups.push(...childResult.recordFilterGroups);
      }
    }
  }

  const hasContent = groupFilters.length > 0 || childGroupResults.length > 0;

  if (hasContent) {
    const currentGroup: RecordFilterGroup = {
      id: groupId,
      logicalOperator: urlRecursiveFilterGroup.operator,
      positionInRecordFilterGroup: positionInParent,
    };

    if (isDefined(parentGroupId)) {
      currentGroup.parentRecordFilterGroupId = parentGroupId;
    }

    recordFilterGroups.push(currentGroup);
  }

  return {
    recordFilters,
    recordFilterGroups,
  };
};
