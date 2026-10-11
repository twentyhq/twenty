import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { getRecordFiltersWithFilterTypeFromFieldMetadata } from '@/workflow/workflow-steps/workflow-actions/find-records-action/utils/getRecordFiltersWithFilterTypeFromFieldMetadata';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

const buildFieldMetadataItem = (
  overrides: Partial<FieldMetadataItem>,
): FieldMetadataItem =>
  ({
    id: 'field-id',
    name: 'testField',
    label: 'Test Field',
    type: FieldMetadataType.TEXT,
    ...overrides,
  }) as FieldMetadataItem;

const buildRecordFilter = (overrides: Partial<RecordFilter>): RecordFilter => ({
  id: 'filter-id',
  fieldMetadataId: 'field-id',
  value: '',
  displayValue: '',
  type: 'TEXT',
  operand: ViewFilterOperand.IS,
  label: 'Test Field',
  ...overrides,
});

describe('getRecordFiltersWithFilterTypeFromFieldMetadata', () => {
  it('should derive the relation filter type for a morph relation field', () => {
    const morphRelationField = buildFieldMetadataItem({
      id: 'morph-field-id',
      type: FieldMetadataType.MORPH_RELATION,
    });

    const [recordFilter] = getRecordFiltersWithFilterTypeFromFieldMetadata({
      recordFilters: [
        buildRecordFilter({
          fieldMetadataId: 'morph-field-id',
          type: FieldMetadataType.MORPH_RELATION as RecordFilter['type'],
        }),
      ],
      fieldMetadataItemByIdMap: new Map([
        [morphRelationField.id, morphRelationField],
      ]),
    });

    expect(recordFilter.type).toBe('RELATION');
  });

  it('should derive the filter type from the relation target field', () => {
    const relationField = buildFieldMetadataItem({
      id: 'relation-field-id',
      type: FieldMetadataType.RELATION,
    });
    const targetField = buildFieldMetadataItem({
      id: 'target-field-id',
      type: FieldMetadataType.SELECT,
    });

    const [recordFilter] = getRecordFiltersWithFilterTypeFromFieldMetadata({
      recordFilters: [
        buildRecordFilter({
          fieldMetadataId: 'relation-field-id',
          relationTargetFieldMetadataId: 'target-field-id',
          type: 'RELATION',
        }),
      ],
      fieldMetadataItemByIdMap: new Map([
        [relationField.id, relationField],
        [targetField.id, targetField],
      ]),
    });

    expect(recordFilter.type).toBe('SELECT');
  });

  it('should keep the persisted filter type when the field is unknown', () => {
    const [recordFilter] = getRecordFiltersWithFilterTypeFromFieldMetadata({
      recordFilters: [buildRecordFilter({ type: 'NUMBER' })],
      fieldMetadataItemByIdMap: new Map(),
    });

    expect(recordFilter.type).toBe('NUMBER');
  });
});
