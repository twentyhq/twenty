import { parseDashboardFilterValuesFromSearchParams } from '@/page-layout/dashboard-filters/utils/parseDashboardFilterValuesFromSearchParams';
import { ViewFilterOperand } from 'twenty-shared/types';

describe('parseDashboardFilterValuesFromSearchParams', () => {
  it('parses operand and value for known slots', () => {
    const searchParams = new URLSearchParams(
      'dashboardFilter[built-in-date][operand]=IS_AFTER&dashboardFilter[built-in-date][value]=2024-01-01T00:00:00.000Z',
    );

    expect(
      parseDashboardFilterValuesFromSearchParams({
        searchParams,
        slotIds: ['built-in-date'],
      }),
    ).toEqual({
      'built-in-date': {
        operand: ViewFilterOperand.IS_AFTER,
        value: '2024-01-01T00:00:00.000Z',
      },
    });
  });

  it('parses encoded brackets as written by URLSearchParams', () => {
    const searchParams = new URLSearchParams();
    searchParams.set('dashboardFilter[built-in-date][operand]', 'IS_TODAY');
    searchParams.set('dashboardFilter[built-in-date][value]', '');

    expect(
      parseDashboardFilterValuesFromSearchParams({
        searchParams: new URLSearchParams(searchParams.toString()),
        slotIds: ['built-in-date'],
      }),
    ).toEqual({
      'built-in-date': { operand: ViewFilterOperand.IS_TODAY, value: '' },
    });
  });

  it('defaults a missing value to an empty string', () => {
    const searchParams = new URLSearchParams(
      'dashboardFilter[built-in-date][operand]=IS_TODAY',
    );

    expect(
      parseDashboardFilterValuesFromSearchParams({
        searchParams,
        slotIds: ['built-in-date'],
      }),
    ).toEqual({
      'built-in-date': { operand: ViewFilterOperand.IS_TODAY, value: '' },
    });
  });

  it('ignores slots that are not part of the dashboard', () => {
    const searchParams = new URLSearchParams(
      'dashboardFilter[unknown-slot][operand]=IS_TODAY',
    );

    expect(
      parseDashboardFilterValuesFromSearchParams({
        searchParams,
        slotIds: ['built-in-date'],
      }),
    ).toEqual({});
  });

  it('ignores everything when an operand is not a known operand', () => {
    const searchParams = new URLSearchParams(
      'dashboardFilter[built-in-date][operand]=NOT_AN_OPERAND&dashboardFilter[built-in-date][value]=x',
    );

    expect(
      parseDashboardFilterValuesFromSearchParams({
        searchParams,
        slotIds: ['built-in-date'],
      }),
    ).toEqual({});
  });

  it('returns nothing when there are no dashboard filter params', () => {
    const searchParams = new URLSearchParams('viewId=abc&filter[name][IS]=x');

    expect(
      parseDashboardFilterValuesFromSearchParams({
        searchParams,
        slotIds: ['built-in-date'],
      }),
    ).toEqual({});
  });
});
