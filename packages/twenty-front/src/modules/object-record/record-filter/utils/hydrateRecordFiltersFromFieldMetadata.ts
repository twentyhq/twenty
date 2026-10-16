import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type PersistedRecordFilter } from '@/object-record/record-filter/types/PersistedRecordFilter';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { getRecordFilterTypeAndLabelFromFieldMetadata } from '@/object-record/record-filter/utils/getRecordFilterTypeAndLabelFromFieldMetadata';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const hydrateRecordFiltersFromFieldMetadata = ({
  persistedRecordFilters,
  fieldMetadataItems,
}: {
  persistedRecordFilters: PersistedRecordFilter[];
  fieldMetadataItems: FieldMetadataItem[];
}): {
  recordFilters: RecordFilter[];
  unresolvedRecordFilters: PersistedRecordFilter[];
} => {
  const recordFilters: RecordFilter[] = [];
  const unresolvedRecordFilters: PersistedRecordFilter[] = [];

  for (const persistedRecordFilter of persistedRecordFilters) {
    const persistedRecordFilterWithId: PersistedRecordFilter &
      Pick<RecordFilter, 'id' | 'value'> = {
      id: persistedRecordFilter.id ?? v4(),
      fieldMetadataId: persistedRecordFilter.fieldMetadataId,
      operand: persistedRecordFilter.operand,
      value: persistedRecordFilter.value ?? '',
      recordFilterGroupId: persistedRecordFilter.recordFilterGroupId,
      positionInRecordFilterGroup:
        persistedRecordFilter.positionInRecordFilterGroup,
      subFieldName: persistedRecordFilter.subFieldName,
      relationTargetFieldMetadataId:
        persistedRecordFilter.relationTargetFieldMetadataId,
    };

    const recordFilterTypeAndLabel =
      getRecordFilterTypeAndLabelFromFieldMetadata({
        fieldMetadataId: persistedRecordFilterWithId.fieldMetadataId,
        relationTargetFieldMetadataId:
          persistedRecordFilterWithId.relationTargetFieldMetadataId,
        fieldMetadataItems,
      });

    if (!isDefined(recordFilterTypeAndLabel)) {
      unresolvedRecordFilters.push(persistedRecordFilterWithId);
      continue;
    }

    recordFilters.push({
      ...persistedRecordFilterWithId,
      displayValue: persistedRecordFilterWithId.value,
      type: recordFilterTypeAndLabel.type,
      label: recordFilterTypeAndLabel.label,
    });
  }

  return { recordFilters, unresolvedRecordFilters };
};
