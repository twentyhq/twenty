import { parseDashboardFilterValuesFromSearchParams } from '@/page-layout/dashboard-filters/utils/parseDashboardFilterValuesFromSearchParams';
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
  id: 'owner',
  label: 'Owner',
  filterType: 'RELATION',
};

const parse = (query: string, slots: DashboardFilterSlot[] = [DATE_SLOT]) =>
  parseDashboardFilterValuesFromSearchParams({
    searchParams: new URLSearchParams(query),
    pageLayoutId: PAGE_LAYOUT_ID,
    slots,
  });

describe('parseDashboardFilterValuesFromSearchParams', () => {
  it('parses operand and value of the page layout namespace for known slots', () => {
    expect(
      parse(
        'dashboardFilter[page-layout-a][built-in-date][operand]=IS_AFTER&dashboardFilter[page-layout-a][built-in-date][value]=2024-01-01T00:00:00.000Z',
      ),
    ).toEqual({
      'built-in-date': {
        operand: ViewFilterOperand.IS_AFTER,
        value: '2024-01-01T00:00:00.000Z',
      },
    });
  });

  it('parses encoded brackets as written by URLSearchParams', () => {
    const searchParams = new URLSearchParams();
    searchParams.set(
      'dashboardFilter[page-layout-a][built-in-date][operand]',
      'IS_TODAY',
    );
    searchParams.set(
      'dashboardFilter[page-layout-a][built-in-date][value]',
      '',
    );

    expect(parse(searchParams.toString())).toEqual({
      'built-in-date': { operand: ViewFilterOperand.IS_TODAY, value: '' },
    });
  });

  it('defaults a missing value to an empty string', () => {
    expect(
      parse('dashboardFilter[page-layout-a][built-in-date][operand]=IS_TODAY'),
    ).toEqual({
      'built-in-date': { operand: ViewFilterOperand.IS_TODAY, value: '' },
    });
  });

  it('ignores another page layout namespace', () => {
    expect(
      parse('dashboardFilter[page-layout-b][built-in-date][operand]=IS_TODAY'),
    ).toEqual({});
  });

  it('ignores slots that are not part of the dashboard', () => {
    expect(
      parse('dashboardFilter[page-layout-a][unknown-slot][operand]=IS_TODAY'),
    ).toEqual({});
  });

  it('drops a slot whose operand is not a known operand', () => {
    expect(
      parse(
        'dashboardFilter[page-layout-a][built-in-date][operand]=NOT_AN_OPERAND&dashboardFilter[page-layout-a][built-in-date][value]=x',
      ),
    ).toEqual({});
  });

  it('drops a slot whose operand is not offered by the slot type', () => {
    expect(
      parse(
        'dashboardFilter[page-layout-a][built-in-date][operand]=CONTAINS&dashboardFilter[page-layout-a][built-in-date][value]=x',
      ),
    ).toEqual({});
  });

  it('drops a slot whose value does not match the operand', () => {
    expect(
      parse(
        'dashboardFilter[page-layout-a][built-in-date][operand]=IS_AFTER&dashboardFilter[page-layout-a][built-in-date][value]=garbage',
      ),
    ).toEqual({});
  });

  it('drops a slot whose relative date is malformed', () => {
    expect(
      parse(
        'dashboardFilter[page-layout-a][built-in-date][operand]=IS_RELATIVE&dashboardFilter[page-layout-a][built-in-date][value]={bad',
      ),
    ).toEqual({});
  });

  it('keeps the valid slots when another slot is malformed', () => {
    expect(
      parse(
        'dashboardFilter[page-layout-a][built-in-date][operand]=IS_TODAY&dashboardFilter[page-layout-a][owner][operand]=IS_AFTER&dashboardFilter[page-layout-a][owner][value]=x',
        [DATE_SLOT, OWNER_SLOT],
      ),
    ).toEqual({
      'built-in-date': { operand: ViewFilterOperand.IS_TODAY, value: '' },
    });
  });

  it('returns nothing when there are no dashboard filter params', () => {
    expect(parse('viewId=abc&filter[name][IS]=x')).toEqual({});
  });
});
