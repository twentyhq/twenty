import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { omitRecordFiltersExcludedFromQueries } from '@/object-record/record-index/utils/omitRecordFiltersExcludedFromQueries';
import { ViewFilterOperand } from 'twenty-shared/types';

const recordFilter = (id: string): RecordFilter => ({
  id,
  fieldMetadataId: 'close-date-field-id',
  value: '',
  displayValue: '',
  type: 'DATE_TIME',
  operand: ViewFilterOperand.IS_TODAY,
  label: 'Close date',
});

describe('omitRecordFiltersExcludedFromQueries', () => {
  it('should leave out the excluded filters and keep the others', () => {
    const kept = recordFilter('kept');

    expect(
      omitRecordFiltersExcludedFromQueries({
        recordFilters: [recordFilter('excluded'), kept],
        excludedRecordFilterIds: ['excluded'],
      }),
    ).toEqual([kept]);
  });

  it('should return the same filters when nothing is excluded', () => {
    const recordFilters = [recordFilter('kept')];

    expect(
      omitRecordFiltersExcludedFromQueries({
        recordFilters,
        excludedRecordFilterIds: [],
      }),
    ).toBe(recordFilters);
  });
});
