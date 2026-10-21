import { type PersistedRecordFilter } from '@/object-record/record-filter/types/PersistedRecordFilter';
import { isValidSubFieldName } from '@/settings/data-model/utils/isValidSubFieldName';
import { isNonEmptyString } from '@sniptt/guards';
import { type ConditionalDisplay } from 'twenty-shared/types';

export const mapConditionalDisplayToPersistedRecordFilters = (
  conditionalDisplay: ConditionalDisplay | null | undefined,
): PersistedRecordFilter[] =>
  (conditionalDisplay?.recordFilters ?? []).map((recordFilter) => ({
    id: recordFilter.id,
    fieldMetadataId: recordFilter.fieldMetadataId ?? '',
    contextKey: recordFilter.contextKey,
    operand: recordFilter.operand,
    value: recordFilter.value ?? '',
    recordFilterGroupId: recordFilter.recordFilterGroupId ?? undefined,
    positionInRecordFilterGroup: recordFilter.positionInRecordFilterGroup,
    subFieldName:
      isNonEmptyString(recordFilter.subFieldName) &&
      isValidSubFieldName(recordFilter.subFieldName)
        ? recordFilter.subFieldName
        : null,
    relationTargetFieldMetadataId: recordFilter.relationTargetFieldMetadataId,
  }));
