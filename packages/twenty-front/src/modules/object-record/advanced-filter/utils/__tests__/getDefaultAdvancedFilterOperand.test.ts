import { getDefaultAdvancedFilterOperand } from '@/object-record/advanced-filter/utils/getDefaultAdvancedFilterOperand';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { ViewFilterOperand } from 'twenty-shared/types';

describe('getDefaultAdvancedFilterOperand', () => {
  it('should default DATE fields to IS_RELATIVE', () => {
    expect(getDefaultAdvancedFilterOperand({ filterType: 'DATE' })).toBe(
      ViewFilterOperand.IS_RELATIVE,
    );
  });

  it('should default DATE_TIME fields to IS_RELATIVE', () => {
    expect(getDefaultAdvancedFilterOperand({ filterType: 'DATE_TIME' })).toBe(
      ViewFilterOperand.IS_RELATIVE,
    );
  });

  it('should keep the first available operand for non-date fields', () => {
    const filterType = 'TEXT';

    expect(getDefaultAdvancedFilterOperand({ filterType })).toBe(
      getRecordFilterOperands({ filterType })[0],
    );
  });
});
