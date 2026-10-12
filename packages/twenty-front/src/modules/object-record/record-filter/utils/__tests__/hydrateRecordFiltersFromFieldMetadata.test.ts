import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { hydrateRecordFiltersFromFieldMetadata } from '@/object-record/record-filter/utils/hydrateRecordFiltersFromFieldMetadata';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

const ownerFieldMetadataItem = {
  id: 'owner-field-id',
  name: 'owner',
  label: 'Owner',
  type: FieldMetadataType.MORPH_RELATION,
} as FieldMetadataItem;

const buildRecordFilter = (overrides: Partial<RecordFilter>): RecordFilter => ({
  id: 'filter-id',
  fieldMetadataId: ownerFieldMetadataItem.id,
  value: '',
  displayValue: '',
  type: 'TEXT',
  operand: ViewFilterOperand.IS_EMPTY,
  label: '',
  ...overrides,
});

describe('hydrateRecordFiltersFromFieldMetadata', () => {
  it('should replace a persisted raw field type and label with the ones derived from field metadata', () => {
    expect(
      hydrateRecordFiltersFromFieldMetadata({
        recordFilters: [
          buildRecordFilter({
            type: FieldMetadataType.MORPH_RELATION as RecordFilter['type'],
            label: 'Stale label',
          }),
        ],
        fieldMetadataItems: [ownerFieldMetadataItem],
      }),
    ).toEqual([buildRecordFilter({ type: 'RELATION', label: 'Owner' })]);
  });

  it('should keep a filter unchanged when its field is unknown', () => {
    const recordFilter = buildRecordFilter({
      fieldMetadataId: 'deleted-field-id',
      type: 'NUMBER',
      label: 'Deleted field',
    });

    expect(
      hydrateRecordFiltersFromFieldMetadata({
        recordFilters: [recordFilter],
        fieldMetadataItems: [ownerFieldMetadataItem],
      }),
    ).toEqual([recordFilter]);
  });
});
