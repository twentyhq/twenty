import { parseDashboardFilterValuesFromSearchParams } from '@/page-layout/dashboard-filters/utils/parseDashboardFilterValuesFromSearchParams';
import { ViewFilterOperand } from 'twenty-shared/types';

describe('parseDashboardFilterValuesFromSearchParams', () => {
  it('reads operand and value for known slots', () => {
    const searchParams = new URLSearchParams();
    searchParams.set('dashboardFilter[date][operand]', 'IS_RELATIVE');
    searchParams.set('dashboardFilter[date][value]', '{"direction":"THIS"}');
    searchParams.set('viewId', 'view-id');

    expect(
      parseDashboardFilterValuesFromSearchParams({
        searchParams,
        slotIds: ['date'],
      }),
    ).toEqual({
      date: {
        operand: ViewFilterOperand.IS_RELATIVE,
        value: '{"direction":"THIS"}',
      },
    });
  });

  it('ignores slots that are not in the layout', () => {
    const searchParams = new URLSearchParams();
    searchParams.set('dashboardFilter[unknown][operand]', 'IS');
    searchParams.set('dashboardFilter[unknown][value]', '2026-01-01');

    expect(
      parseDashboardFilterValuesFromSearchParams({
        searchParams,
        slotIds: ['date'],
      }),
    ).toEqual({});
  });

  it('defaults a missing value to an empty string for valueless operands', () => {
    const searchParams = new URLSearchParams();
    searchParams.set('dashboardFilter[date][operand]', 'IS_TODAY');

    expect(
      parseDashboardFilterValuesFromSearchParams({
        searchParams,
        slotIds: ['date'],
      }),
    ).toEqual({ date: { operand: ViewFilterOperand.IS_TODAY, value: '' } });
  });

  it('returns nothing for an unknown operand', () => {
    const searchParams = new URLSearchParams();
    searchParams.set('dashboardFilter[date][operand]', 'NOT_AN_OPERAND');
    searchParams.set('dashboardFilter[date][value]', '2026-01-01');

    expect(
      parseDashboardFilterValuesFromSearchParams({
        searchParams,
        slotIds: ['date'],
      }),
    ).toEqual({});
  });

  it('returns nothing when the URL has no dashboard filter params', () => {
    const searchParams = new URLSearchParams('filter[name][IS]=Acme');

    expect(
      parseDashboardFilterValuesFromSearchParams({
        searchParams,
        slotIds: ['date'],
      }),
    ).toEqual({});
  });
});
