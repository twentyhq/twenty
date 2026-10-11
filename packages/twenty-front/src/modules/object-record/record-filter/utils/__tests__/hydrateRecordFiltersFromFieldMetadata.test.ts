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
    ).toEqual([
      {
        ...persistedRecordFilter,
        subFieldName: undefined,
        relationTargetFieldMetadataId: undefined,
        type: 'RELATION',
        label: 'Owner',
        displayValue: '{{trigger.ownerId}}',
      },
    ]);
  });

  it('should drop a filter whose field no longer exists', () => {
    expect(
      hydrateRecordFiltersFromFieldMetadata({
        persistedRecordFilters: [
          { ...persistedRecordFilter, fieldMetadataId: 'deleted-field-id' },
        ],
        fieldMetadataItems: [ownerFieldMetadataItem],
      }),
    ).toEqual([]);
  });

  it('should give an id to a filter persisted without one', () => {
    const { id: _id, ...persistedRecordFilterWithoutId } =
      persistedRecordFilter;

    const [recordFilter] = hydrateRecordFiltersFromFieldMetadata({
      persistedRecordFilters: [persistedRecordFilterWithoutId],
      fieldMetadataItems: [ownerFieldMetadataItem],
    });

    expect(recordFilter.id).toEqual(expect.any(String));
  });
});
