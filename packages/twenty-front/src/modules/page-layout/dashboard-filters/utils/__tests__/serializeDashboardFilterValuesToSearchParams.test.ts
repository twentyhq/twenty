import { parseDashboardFilterValuesFromSearchParams } from '@/page-layout/dashboard-filters/utils/parseDashboardFilterValuesFromSearchParams';
import { serializeDashboardFilterValuesToSearchParams } from '@/page-layout/dashboard-filters/utils/serializeDashboardFilterValuesToSearchParams';
import {
  type DashboardFilterSlot,
  ViewFilterOperand,
} from 'twenty-shared/types';

const PAGE_LAYOUT_ID = 'page-layout-a';

const DATE_SLOT: DashboardFilterSlot = {
  id: 'built-in-date',
  label: 'Date',
  filterType: 'DATE_TIME',
};

const OWNER_SLOT: DashboardFilterSlot = {
  id: 'built-in-owner',
  label: 'Owner',
  filterType: 'RELATION',
};

describe('serializeDashboardFilterValuesToSearchParams', () => {
  it('writes operand and value params under the page layout namespace', () => {
    const result = serializeDashboardFilterValuesToSearchParams({
      searchParams: new URLSearchParams(),
      pageLayoutId: PAGE_LAYOUT_ID,
      slots: [DATE_SLOT, OWNER_SLOT],
      values: {
        'built-in-date': {
          operand: ViewFilterOperand.IS_AFTER,
          value: '2024-01-01T00:00:00.000Z',
        },
      },
    });

    expect(
      result.get('dashboardFilter[page-layout-a][built-in-date][operand]'),
    ).toBe('IS_AFTER');
    expect(
      result.get('dashboardFilter[page-layout-a][built-in-date][value]'),
    ).toBe('2024-01-01T00:00:00.000Z');
  });

  it('preserves unrelated params and other page layout namespaces, replacing stale params of its own', () => {
    const result = serializeDashboardFilterValuesToSearchParams({
      searchParams: new URLSearchParams(
        'viewId=abc&dashboardFilter[page-layout-a][built-in-date][operand]=IS_TODAY&dashboardFilter[page-layout-a][built-in-date][value]=&dashboardFilter[page-layout-a][owner][operand]=IS&dashboardFilter[page-layout-b][built-in-date][operand]=IS_IN_FUTURE',
      ),
      pageLayoutId: PAGE_LAYOUT_ID,
      slots: [DATE_SLOT, OWNER_SLOT],
      values: {
        'built-in-date': { operand: ViewFilterOperand.IS_IN_PAST, value: '' },
      },
    });

    expect(result.get('viewId')).toBe('abc');
    expect(
      result.get('dashboardFilter[page-layout-a][built-in-date][operand]'),
    ).toBe('IS_IN_PAST');
    expect(result.has('dashboardFilter[page-layout-a][owner][operand]')).toBe(
      false,
    );
    expect(
      result.get('dashboardFilter[page-layout-b][built-in-date][operand]'),
    ).toBe('IS_IN_FUTURE');
  });

  it('removes the params of a cleared slot', () => {
    const result = serializeDashboardFilterValuesToSearchParams({
      searchParams: new URLSearchParams(
        'viewId=abc&dashboardFilter[page-layout-a][built-in-date][operand]=IS_TODAY&dashboardFilter[page-layout-a][built-in-date][value]=',
      ),
      pageLayoutId: PAGE_LAYOUT_ID,
      slots: [DATE_SLOT, OWNER_SLOT],
      values: { 'built-in-date': undefined },
    });

    expect(result.toString()).toBe('viewId=abc');
  });

  it('does not change the original search params', () => {
    const searchParams = new URLSearchParams('viewId=abc');

    serializeDashboardFilterValuesToSearchParams({
      searchParams,
      pageLayoutId: PAGE_LAYOUT_ID,
      slots: [DATE_SLOT, OWNER_SLOT],
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
        value: 'PAST_7_DAY',
      },
    };

    const serialized = serializeDashboardFilterValuesToSearchParams({
      searchParams: new URLSearchParams(),
      pageLayoutId: PAGE_LAYOUT_ID,
      slots: [DATE_SLOT, OWNER_SLOT],
      values,
    });

    expect(
      parseDashboardFilterValuesFromSearchParams({
        searchParams: new URLSearchParams(serialized.toString()),
        pageLayoutId: PAGE_LAYOUT_ID,
        slots: [DATE_SLOT],
      }),
    ).toEqual(values);
  });

  it('round-trips a JSON relation value whose brackets must not be read as nesting', () => {
    const values = {
      'built-in-owner': {
        operand: ViewFilterOperand.IS,
        value: JSON.stringify({
          isCurrentWorkspaceMemberSelected: true,
          selectedRecordIds: ['20202020-0687-4c41-b707-ed1bfca972a7'],
        }),
      },
    };

    const serialized = serializeDashboardFilterValuesToSearchParams({
      searchParams: new URLSearchParams(),
      pageLayoutId: PAGE_LAYOUT_ID,
      slots: [DATE_SLOT, OWNER_SLOT],
      values,
    });

    expect(
      parseDashboardFilterValuesFromSearchParams({
        searchParams: new URLSearchParams(serialized.toString()),
        pageLayoutId: PAGE_LAYOUT_ID,
        slots: [DATE_SLOT, OWNER_SLOT],
      }),
    ).toEqual(values);
  });

  it('leaves out a value whose slot no longer exists', () => {
    const result = serializeDashboardFilterValuesToSearchParams({
      searchParams: new URLSearchParams(),
      pageLayoutId: PAGE_LAYOUT_ID,
      slots: [DATE_SLOT],
      values: {
        'built-in-date': { operand: ViewFilterOperand.IS_TODAY, value: '' },
        'built-in-owner': {
          operand: ViewFilterOperand.IS,
          value: JSON.stringify({
            isCurrentWorkspaceMemberSelected: true,
            selectedRecordIds: [],
          }),
        },
      },
    });

    expect(Array.from(result.keys())).toEqual([
      'dashboardFilter[page-layout-a][built-in-date][operand]',
      'dashboardFilter[page-layout-a][built-in-date][value]',
    ]);
  });
});
