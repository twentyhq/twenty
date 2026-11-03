import { removeEmptyRecordFilterGroups } from '@/object-record/record-filter-group/utils/removeEmptyRecordFilterGroups';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type PersistedRecordFilter } from '@/object-record/record-filter/types/PersistedRecordFilter';
import { sanitizeRecordFilters } from '@/object-record/record-filter/utils/sanitizeRecordFilters';
import {
  type ConditionalDisplay,
  type ConditionalDisplayRecordFilter,
  type ConditionalDisplaySelectedRecordsMatch,
} from 'twenty-shared/types';
import {
  isConditionalDisplayAdminContextKey,
  isDefined,
  isNonEmptyArray,
  isRecordFilterValueValid,
} from 'twenty-shared/utils';

type SanitizeConditionalDisplayParams = {
  recordFilters: PersistedRecordFilter[];
  recordFilterGroups: RecordFilterGroup[];
  selectedRecordsMatch?: ConditionalDisplaySelectedRecordsMatch;
  fieldMetadataItems: Parameters<
    typeof sanitizeRecordFilters
  >[0]['fieldMetadataItems'];
};

export const sanitizeConditionalDisplay = ({
  recordFilters,
  recordFilterGroups,
  selectedRecordsMatch,
  fieldMetadataItems,
}: SanitizeConditionalDisplayParams): ConditionalDisplay | null => {
  const { recordFilters: sanitizedFieldRecordFilters = [] } =
    sanitizeRecordFilters({
      recordFiltersWithGroups: {
        recordFilters: recordFilters.filter(
          (recordFilter) =>
            !isConditionalDisplayAdminContextKey(recordFilter.fieldMetadataId),
        ),
        recordFilterGroups,
      },
      fieldMetadataItems,
    });

  const sanitizedFieldRecordFilterById = new Map(
    sanitizedFieldRecordFilters.map((recordFilter) => [
      recordFilter.id,
      recordFilter,
    ]),
  );

  const validRecordFilters = recordFilters.flatMap((recordFilter) => {
    if (isConditionalDisplayAdminContextKey(recordFilter.fieldMetadataId)) {
      return isRecordFilterValueValid({
        operand: recordFilter.operand,
        value: recordFilter.value ?? '',
      })
        ? [recordFilter]
        : [];
    }

    const sanitizedRecordFilter = sanitizedFieldRecordFilterById.get(
      recordFilter.id,
    );

    return isDefined(sanitizedRecordFilter) ? [sanitizedRecordFilter] : [];
  });

  const remainingRecordFilterGroups = removeEmptyRecordFilterGroups({
    recordFilters: validRecordFilters,
    recordFilterGroups,
  });

  const conditionalDisplayRecordFilters: ConditionalDisplayRecordFilter[] =
    validRecordFilters.map((recordFilter) =>
      isConditionalDisplayAdminContextKey(recordFilter.fieldMetadataId)
        ? {
            id: recordFilter.id ?? '',
            contextKey: recordFilter.fieldMetadataId,
            operand: recordFilter.operand,
            value: recordFilter.value,
            recordFilterGroupId: recordFilter.recordFilterGroupId,
            positionInRecordFilterGroup:
              recordFilter.positionInRecordFilterGroup,
          }
        : {
            id: recordFilter.id ?? '',
            fieldMetadataId: recordFilter.fieldMetadataId,
            subFieldName: recordFilter.subFieldName,
            relationTargetFieldMetadataId:
              recordFilter.relationTargetFieldMetadataId,
            operand: recordFilter.operand,
            value: recordFilter.value,
            recordFilterGroupId: recordFilter.recordFilterGroupId,
            positionInRecordFilterGroup:
              recordFilter.positionInRecordFilterGroup,
          },
    );

  if (!isNonEmptyArray(conditionalDisplayRecordFilters)) {
    return null;
  }

  const conditionalDisplay: ConditionalDisplay = {
    recordFilters: conditionalDisplayRecordFilters,
    recordFilterGroups: remainingRecordFilterGroups,
  };

  if (isDefined(selectedRecordsMatch)) {
    conditionalDisplay.selectedRecordsMatch = selectedRecordsMatch;
  }

  return conditionalDisplay;
};
