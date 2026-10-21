import { hasConditionalDisplayContextRecordFilterValue } from '@/conditional-display/utils/hasConditionalDisplayContextRecordFilterValue';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { type PersistedRecordFilter } from '@/object-record/record-filter/types/PersistedRecordFilter';
import { sanitizeChartRecordFilters } from '@/side-panel/pages/page-layout/utils/sanitizeChartRecordFilters';
import {
  type ConditionalDisplay,
  type ConditionalDisplayContextKey,
  type ConditionalDisplayQuantifier,
  type ConditionalDisplayRecordFilter,
} from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

type SanitizeConditionalDisplayParams = {
  recordFilters: PersistedRecordFilter[];
  recordFilterGroups: RecordFilterGroup[];
  quantifier?: ConditionalDisplayQuantifier;
  availableContextKeys: ConditionalDisplayContextKey[];
  fieldMetadataItems: (Pick<FieldMetadataItem, 'id' | 'isActive'> & {
    morphRelations?: { sourceFieldMetadata: { id: string } }[] | null;
  })[];
};

export const sanitizeConditionalDisplay = ({
  recordFilters,
  recordFilterGroups,
  quantifier,
  availableContextKeys,
  fieldMetadataItems,
}: SanitizeConditionalDisplayParams): ConditionalDisplay | null => {
  const recordFiltersToSanitize = {
    recordFilters: recordFilters.filter(
      (recordFilter) =>
        !isDefined(recordFilter.contextKey) ||
        (availableContextKeys.includes(recordFilter.contextKey) &&
          hasConditionalDisplayContextRecordFilterValue({
            contextKey: recordFilter.contextKey,
            value: recordFilter.value,
          })),
    ),
    recordFilterGroups,
  };

  const {
    recordFilters: validRecordFilters = [],
    recordFilterGroups: remainingRecordFilterGroups = [],
  } = sanitizeChartRecordFilters({
    chartFilters: recordFiltersToSanitize,
    fieldMetadataItems,
  });

  const conditionalDisplayRecordFilters: ConditionalDisplayRecordFilter[] =
    validRecordFilters.map((recordFilter) =>
      isDefined(recordFilter.contextKey)
        ? {
            id: recordFilter.id ?? '',
            contextKey: recordFilter.contextKey,
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

  if (isDefined(quantifier)) {
    conditionalDisplay.quantifier = quantifier;
  }

  return conditionalDisplay;
};
