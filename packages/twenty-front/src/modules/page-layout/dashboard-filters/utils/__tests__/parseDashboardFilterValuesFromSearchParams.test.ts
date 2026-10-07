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

  it('keeps valid slots when a foreign dashboardFilter entry is malformed', () => {
    const searchParams = new URLSearchParams();
    searchParams.set('dashboardFilter[date][operand]', 'IS_AFTER');
    searchParams.set('dashboardFilter[date][value]', '2026-01-01');
    searchParams.set('dashboardFilter[x]', '1');

    expect(
      parseDashboardFilterValuesFromSearchParams({
        searchParams,
        slotIds: ['date', 'x'],
      }),
    ).toEqual({
      date: { operand: ViewFilterOperand.IS_AFTER, value: '2026-01-01' },
    });
  });

  it('drops only the slot whose entry is malformed', () => {
    const searchParams = new URLSearchParams();
    searchParams.set('dashboardFilter[date]', 'not-an-object');
    searchParams.set('dashboardFilter[owner][operand]', 'IS');
    searchParams.set('dashboardFilter[owner][value]', '["member-id"]');

    expect(
      parseDashboardFilterValuesFromSearchParams({
        searchParams,
        slotIds: ['date', 'owner'],
      }),
    ).toEqual({
      owner: { operand: ViewFilterOperand.IS, value: '["member-id"]' },
    });
  });

  it('returns nothing when dashboardFilter is not an object', () => {
    const searchParams = new URLSearchParams('dashboardFilter=1');

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
