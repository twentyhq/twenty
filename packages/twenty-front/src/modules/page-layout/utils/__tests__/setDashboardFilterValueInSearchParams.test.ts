import { setDashboardFilterValueInSearchParams } from '@/page-layout/utils/setDashboardFilterValueInSearchParams';
import { ViewFilterOperand } from 'twenty-shared/types';

const setValue = (
  search: string,
  value: Parameters<typeof setDashboardFilterValueInSearchParams>[0]['value'],
) =>
  decodeURIComponent(
    setDashboardFilterValueInSearchParams({
      searchParams: new URLSearchParams(search),
      pageLayoutFilterId: 'a',
      value,
    }).toString(),
  );

describe('setDashboardFilterValueInSearchParams', () => {
  it('should replace the value of one filter and keep the other params', () => {
    expect(
      setValue(
        'tab=1&dashboardFilter[a][IS_RELATIVE]=PAST_7_DAY&dashboardFilter[b]=',
        {
          conditions: [
            { operand: ViewFilterOperand.IS_AFTER, value: '2026-01-01' },
            { operand: ViewFilterOperand.IS_BEFORE, value: '2026-02-01' },
          ],
        },
      ),
    ).toBe(
      'tab=1&dashboardFilter[b]=&dashboardFilter[a][IS_AFTER]=2026-01-01&dashboardFilter[a][IS_BEFORE]=2026-02-01',
    );
  });

  it('should write an empty value when the range is cleared', () => {
    expect(setValue('', { conditions: [] })).toBe('dashboardFilter[a]=');
  });

  it('should remove the value of the filter for null', () => {
    expect(setValue('dashboardFilter[a][IS_RELATIVE]=PAST_7_DAY', null)).toBe(
      '',
    );
  });
});
