import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
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

  const currentGroup: RecordFilterGroup = {
    id: groupId,
    logicalOperator: urlRecursiveFilterGroup.operator,
    positionInRecordFilterGroup: positionInParent,
  };

  if (isDefined(parentGroupId)) {
    currentGroup.parentRecordFilterGroupId = parentGroupId;
  }

  recordFilterGroups.push(currentGroup);

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
        recordFilters.push(recordFilter);
      }
    }
  }

  if (isDefined(urlRecursiveFilterGroup.groups)) {
    for (const childUrlGroup of urlRecursiveFilterGroup.groups) {
      const childResult = deserializeUrlRecursiveFilterGroup({
        urlRecursiveFilterGroup: childUrlGroup,
        objectMetadataItem,
        parentGroupId: groupId,
        positionInParent: positionCounter++,
      });

      recordFilters.push(...childResult.recordFilters);
      recordFilterGroups.push(...childResult.recordFilterGroups);
    }
  }

  return {
    recordFilters,
    recordFilterGroups,
  };
};
