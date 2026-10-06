import { parseDashboardFilterValuesFromSearchParams } from '@/page-layout/dashboard-filters/utils/parseDashboardFilterValuesFromSearchParams';
import { serializeDashboardFilterValuesToSearchParams } from '@/page-layout/dashboard-filters/utils/serializeDashboardFilterValuesToSearchParams';
import { ViewFilterOperand } from 'twenty-shared/types';

describe('serializeDashboardFilterValuesToSearchParams', () => {
  it('writes operand and value params for each slot value', () => {
    const result = serializeDashboardFilterValuesToSearchParams({
      searchParams: new URLSearchParams(),
      values: {
        'built-in-date': {
          operand: ViewFilterOperand.IS_AFTER,
          value: '2024-01-01T00:00:00.000Z',
        },
      },
    });

    expect(result.get('dashboardFilter[built-in-date][operand]')).toBe(
      'IS_AFTER',
    );
    expect(result.get('dashboardFilter[built-in-date][value]')).toBe(
      '2024-01-01T00:00:00.000Z',
    );
  });

  it('preserves unrelated params and replaces stale dashboard filter params', () => {
    const result = serializeDashboardFilterValuesToSearchParams({
      searchParams: new URLSearchParams(
        'viewId=abc&dashboardFilter[built-in-date][operand]=IS_TODAY&dashboardFilter[built-in-date][value]=&dashboardFilter[owner][operand]=IS',
      ),
      values: {
        'built-in-date': { operand: ViewFilterOperand.IS_IN_PAST, value: '' },
      },
    });

    expect(result.get('viewId')).toBe('abc');
    expect(result.get('dashboardFilter[built-in-date][operand]')).toBe(
      'IS_IN_PAST',
    );
    expect(result.has('dashboardFilter[owner][operand]')).toBe(false);
  });

  it('removes the params of a cleared slot', () => {
    const result = serializeDashboardFilterValuesToSearchParams({
      searchParams: new URLSearchParams(
        'viewId=abc&dashboardFilter[built-in-date][operand]=IS_TODAY&dashboardFilter[built-in-date][value]=',
      ),
      values: { 'built-in-date': undefined },
    });

    expect(result.toString()).toBe('viewId=abc');
  });

  it('does not change the original search params', () => {
    const searchParams = new URLSearchParams('viewId=abc');

    serializeDashboardFilterValuesToSearchParams({
      searchParams,
      values: {
        'built-in-date': { operand: ViewFilterOperand.IS_TODAY, value: '' },
      },
    });

    expect(searchParams.toString()).toBe('viewId=abc');
  });

  it('round-trips through the parser', () => {
    const values = {
      'built-in-date': {
        operand: ViewFilterOperand.IS_RELATIVE,
        value: '{"direction":"PAST","amount":7,"unit":"DAY"}',
      },
    };

    const serialized = serializeDashboardFilterValuesToSearchParams({
      searchParams: new URLSearchParams(),
      values,
    });

    expect(
      parseDashboardFilterValuesFromSearchParams({
        searchParams: new URLSearchParams(serialized.toString()),
        slotIds: ['built-in-date'],
      }),
    ).toEqual(values);
  });
});
