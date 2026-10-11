import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type PersistedRecordFilter } from '@/object-record/record-filter/types/PersistedRecordFilter';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { getRecordFilterTypeAndLabelFromFieldMetadata } from '@/object-record/record-filter/utils/getRecordFilterTypeAndLabelFromFieldMetadata';
import { isDefined } from 'twenty-shared/utils';
import { type SetOptional } from 'type-fest';
import { v4 } from 'uuid';

export const hydrateRecordFiltersFromFieldMetadata = ({
  persistedRecordFilters,
  fieldMetadataItems,
}: {
  persistedRecordFilters: SetOptional<PersistedRecordFilter, 'id'>[];
  fieldMetadataItems: FieldMetadataItem[];
}): RecordFilter[] =>
  persistedRecordFilters.flatMap((persistedRecordFilter) => {
    const recordFilterTypeAndLabel =
      getRecordFilterTypeAndLabelFromFieldMetadata({
        fieldMetadataId: persistedRecordFilter.fieldMetadataId,
        relationTargetFieldMetadataId:
          persistedRecordFilter.relationTargetFieldMetadataId,
        fieldMetadataItems,
      });

    // Same as view filters: a filter whose field no longer resolves is
    // ignored when the query is computed, so it is not shown either
    if (!isDefined(recordFilterTypeAndLabel)) {
      return [];
    }

    return [
      {
        id: persistedRecordFilter.id ?? v4(),
        fieldMetadataId: persistedRecordFilter.fieldMetadataId,
        operand: persistedRecordFilter.operand,
        value: persistedRecordFilter.value,
        displayValue: persistedRecordFilter.value,
        recordFilterGroupId: persistedRecordFilter.recordFilterGroupId,
        positionInRecordFilterGroup:
          persistedRecordFilter.positionInRecordFilterGroup,
        subFieldName: persistedRecordFilter.subFieldName,
        relationTargetFieldMetadataId:
          persistedRecordFilter.relationTargetFieldMetadataId,
        type: recordFilterTypeAndLabel.type,
        label: recordFilterTypeAndLabel.label,
      },
    ];
  });
