import { type ConditionalDisplayContext } from '@/conditional-display/types/ConditionalDisplayContext';
import { isConditionalDisplayContextRecordFilterMatching } from '@/conditional-display/utils/isConditionalDisplayContextRecordFilterMatching';
import { isConditionalDisplayFieldRecordFilterMatching } from '@/conditional-display/utils/isConditionalDisplayFieldRecordFilterMatching';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import {
  type ConditionalDisplay,
  type ConditionalDisplayRecordFilter,
  type ConditionalDisplayRecordFilterGroup,
  RecordFilterGroupLogicalOperator,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

type EvaluateConditionalDisplayParams = {
  conditionalDisplay: ConditionalDisplay | null | undefined;
  context: ConditionalDisplayContext;
  records: Record<string, unknown>[];
  objectMetadataItem?: EnrichedObjectMetadataItem;
  objectMetadataItems: EnrichedObjectMetadataItem[];
};

export const evaluateConditionalDisplay = ({
  conditionalDisplay,
  context,
  records,
  objectMetadataItem,
  objectMetadataItems,
}: EvaluateConditionalDisplayParams): boolean => {
  const recordFilters = conditionalDisplay?.recordFilters ?? [];

  if (!isNonEmptyArray(recordFilters)) {
    return true;
  }

  const hasFieldRecordFilter = recordFilters.some(
    (recordFilter) => !isDefined(recordFilter.contextKey),
  );

  if (hasFieldRecordFilter && !isDefined(objectMetadataItem)) {
    return false;
  }

  const recordFilterGroups = conditionalDisplay?.recordFilterGroups ?? [];

  const recordFilterGroupIds = new Set(
    recordFilterGroups.map((recordFilterGroup) => recordFilterGroup.id),
  );

  const hasOrphanRecordFilter = recordFilters.some(
    (recordFilter) =>
      isDefined(recordFilter.recordFilterGroupId) &&
      !recordFilterGroupIds.has(recordFilter.recordFilterGroupId),
  );

  const hasOrphanRecordFilterGroup = recordFilterGroups.some(
    (recordFilterGroup) =>
      isDefined(recordFilterGroup.parentRecordFilterGroupId) &&
      !recordFilterGroupIds.has(recordFilterGroup.parentRecordFilterGroupId),
  );

  if (hasOrphanRecordFilter || hasOrphanRecordFilterGroup) {
    return false;
  }

  const evaluateForRecord = (record: Record<string, unknown> | undefined) => {
    const isRecordFilterMatching = (
      recordFilter: ConditionalDisplayRecordFilter,
    ) =>
      isDefined(recordFilter.contextKey)
        ? isConditionalDisplayContextRecordFilterMatching({
            recordFilter,
            context,
          })
        : isConditionalDisplayFieldRecordFilterMatching({
            recordFilter,
            record,
            objectMetadataItem,
            objectMetadataItems,
            currentWorkspaceMemberId: context.currentWorkspaceMemberId,
          });

    const isRecordFilterGroupMatching = (
      recordFilterGroup: ConditionalDisplayRecordFilterGroup,
    ): boolean => {
      const childMatches = [
        ...recordFilters
          .filter(
            (recordFilter) =>
              recordFilter.recordFilterGroupId === recordFilterGroup.id,
          )
          .map(isRecordFilterMatching),
        ...recordFilterGroups
          .filter(
            (childRecordFilterGroup) =>
              childRecordFilterGroup.parentRecordFilterGroupId ===
              recordFilterGroup.id,
          )
          .map(isRecordFilterGroupMatching),
      ];

      return recordFilterGroup.logicalOperator ===
        RecordFilterGroupLogicalOperator.OR
        ? childMatches.some((childMatch) => childMatch)
        : childMatches.every((childMatch) => childMatch);
    };

    const ungroupedRecordFiltersMatch = recordFilters
      .filter((recordFilter) => !isDefined(recordFilter.recordFilterGroupId))
      .every(isRecordFilterMatching);

    const rootRecordFilterGroupsMatch = recordFilterGroups
      .filter(
        (recordFilterGroup) =>
          !isDefined(recordFilterGroup.parentRecordFilterGroupId),
      )
      .every(isRecordFilterGroupMatching);

    return ungroupedRecordFiltersMatch && rootRecordFilterGroupsMatch;
  };

  if (!isNonEmptyArray(records)) {
    return evaluateForRecord(undefined);
  }

  return conditionalDisplay?.quantifier === 'SOME'
    ? records.some(evaluateForRecord)
    : records.every(evaluateForRecord);
};
