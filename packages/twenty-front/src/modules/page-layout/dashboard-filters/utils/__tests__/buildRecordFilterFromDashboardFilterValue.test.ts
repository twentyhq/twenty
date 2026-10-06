import { buildRecordFilterFromDashboardFilterValue } from '@/page-layout/dashboard-filters/utils/buildRecordFilterFromDashboardFilterValue';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

describe('buildRecordFilterFromDashboardFilterValue', () => {
  it('builds a record filter labeled after the slot and typed after the field', () => {
    const recordFilter = buildRecordFilterFromDashboardFilterValue({
      slot: { id: 'built-in-date', label: 'Date', filterType: 'DATE_TIME' },
      binding: {
        fieldMetadataId: 'created-at-id',
        subFieldName: null,
        relationTargetFieldMetadataId: null,
      },
      fieldMetadataItem: {
        id: 'created-at-id',
        type: FieldMetadataType.DATE_TIME,
      },
      value: { operand: ViewFilterOperand.IS_TODAY, value: '' },
    });

    expect(recordFilter).toEqual({
      id: 'dashboard-filter-built-in-date',
      fieldMetadataId: 'created-at-id',
      label: 'Date',
      type: 'DATE_TIME',
      operand: ViewFilterOperand.IS_TODAY,
      value: '',
      displayValue: '',
      subFieldName: null,
      relationTargetFieldMetadataId: null,
    });
  });
});
