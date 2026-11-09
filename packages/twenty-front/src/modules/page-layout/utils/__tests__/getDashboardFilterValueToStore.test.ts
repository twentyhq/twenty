import { getDashboardFilterValueToStore } from '@/page-layout/utils/getDashboardFilterValueToStore';
import { ViewFilterOperand } from 'twenty-shared/types';

describe('getDashboardFilterValueToStore', () => {
  it('should drop the time zone and week start of a relative value', () => {
    expect(
      getDashboardFilterValueToStore({
        conditions: [
          {
            operand: ViewFilterOperand.IS_RELATIVE,
            value: 'THIS_1_MONTH;;Europe/Paris;;MONDAY;;',
          },
        ],
      }),
    ).toEqual({
      conditions: [
        { operand: ViewFilterOperand.IS_RELATIVE, value: 'THIS_1_MONTH' },
      ],
    });
  });

  it('should keep a date range as is', () => {
    const dateRange = {
      conditions: [
        { operand: ViewFilterOperand.IS_AFTER, value: '2026-01-01' },
        { operand: ViewFilterOperand.IS_BEFORE, value: '2026-02-01' },
      ],
    };

    expect(getDashboardFilterValueToStore(dateRange)).toEqual(dateRange);
  });

  it.each([null, { conditions: [] }])(
    'should store no default for %p',
    (value) => {
      expect(getDashboardFilterValueToStore(value)).toBeNull();
    },
  );
});
