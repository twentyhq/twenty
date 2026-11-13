import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { getAdHocViewFiltersForRecordIndexTab } from '@/object-record/record-index-tab/utils/getAdHocViewFiltersForRecordIndexTab';
import { type ViewFilter } from '@/views/types/ViewFilter';
import { ViewFilterOperand } from 'twenty-shared/types';

const SAVED_VIEW_FILTER: ViewFilter = {
  id: 'saved-filter',
  fieldMetadataId: 'name-field',
  operand: ViewFilterOperand.CONTAINS,
  value: 'Acme',
};

const buildRecordFilter = (recordFilter: Partial<RecordFilter>): RecordFilter =>
  ({
    id: 'record-filter',
    fieldMetadataId: 'amount-field',
    operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
    value: '500000',
    displayValue: '500000',
    type: 'CURRENCY',
    label: 'Amount',
    ...recordFilter,
  }) as RecordFilter;

describe('getAdHocViewFiltersForRecordIndexTab', () => {
  it('should keep only the filters added or changed since the view was saved', () => {
    const adHocViewFilters = getAdHocViewFiltersForRecordIndexTab({
      viewFilters: [SAVED_VIEW_FILTER],
      recordFilters: [
        buildRecordFilter({
          id: SAVED_VIEW_FILTER.id,
          fieldMetadataId: SAVED_VIEW_FILTER.fieldMetadataId,
          operand: SAVED_VIEW_FILTER.operand,
          value: SAVED_VIEW_FILTER.value,
        }),
        buildRecordFilter({}),
      ],
    });

    expect(adHocViewFilters).toHaveLength(1);
    expect(adHocViewFilters[0]).toMatchObject({
      fieldMetadataId: 'amount-field',
      operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
      value: '500000',
    });
    expect(adHocViewFilters[0].id).not.toBe('record-filter');
  });

  it('should leave out filters that belong to a filter group', () => {
    expect(
      getAdHocViewFiltersForRecordIndexTab({
        viewFilters: [],
        recordFilters: [buildRecordFilter({ recordFilterGroupId: 'group' })],
      }),
    ).toEqual([]);
  });
});
