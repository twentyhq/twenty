import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type PersistedRecordFilter } from '@/object-record/record-filter/types/PersistedRecordFilter';
import { hydrateRecordFiltersFromFieldMetadata } from '@/object-record/record-filter/utils/hydrateRecordFiltersFromFieldMetadata';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

const ownerFieldMetadataItem = {
  id: 'owner-field-id',
  name: 'owner',
  label: 'Owner',
  type: FieldMetadataType.MORPH_RELATION,
} as FieldMetadataItem;

const persistedRecordFilter: PersistedRecordFilter = {
  id: 'filter-id',
  fieldMetadataId: ownerFieldMetadataItem.id,
  operand: ViewFilterOperand.IS,
  value: '{{trigger.ownerId}}',
  recordFilterGroupId: 'group-id',
  positionInRecordFilterGroup: 0,
};

describe('hydrateRecordFiltersFromFieldMetadata', () => {
  it('should derive type, label and display value from field metadata', () => {
    expect(
      hydrateRecordFiltersFromFieldMetadata({
        persistedRecordFilters: [persistedRecordFilter],
        fieldMetadataItems: [ownerFieldMetadataItem],
      }),
    ).toEqual({
      recordFilters: [
        {
          ...persistedRecordFilter,
          type: 'RELATION',
          label: 'Owner',
          displayValue: '{{trigger.ownerId}}',
        },
      ],
      unresolvedRecordFilters: [],
    });
  });

  it('should set apart a filter whose field no longer exists', () => {
    const filterOnDeletedField = {
      ...persistedRecordFilter,
      fieldMetadataId: 'deleted-field-id',
    };

    expect(
      hydrateRecordFiltersFromFieldMetadata({
        persistedRecordFilters: [filterOnDeletedField],
        fieldMetadataItems: [ownerFieldMetadataItem],
      }),
    ).toEqual({
      recordFilters: [],
      unresolvedRecordFilters: [filterOnDeletedField],
    });
  });

  it('should give an id and an empty value to a filter persisted without them', () => {
    const {
      id: _id,
      value: _value,
      ...persistedRecordFilterWithoutIdAndValue
    } = persistedRecordFilter;

    const {
      recordFilters: [recordFilter],
    } = hydrateRecordFiltersFromFieldMetadata({
      persistedRecordFilters: [persistedRecordFilterWithoutIdAndValue],
      fieldMetadataItems: [ownerFieldMetadataItem],
    });

    expect(recordFilter.id).toEqual(expect.any(String));
    expect(recordFilter.value).toBe('');
  });
});
