import { getDashboardFilterSessionMemoryUpdate } from '@/page-layout/utils/getDashboardFilterSessionMemoryUpdate';
import { DASHBOARD_DATE_RANGE_FILTER_ID } from 'twenty-shared/constants';

const KEY = `dashboardFilter[${DASHBOARD_DATE_RANGE_FILTER_ID}][IS_RELATIVE]`;
const PAST_7_DAYS_SEARCH = new URLSearchParams([
  [KEY, 'PAST_7_DAY'],
]).toString();
const THIS_YEAR_SEARCH = new URLSearchParams([[KEY, 'THIS_1_YEAR']]).toString();

describe('getDashboardFilterSessionMemoryUpdate', () => {
  it('should do nothing without a URL value or a remembered value', () => {
    expect(
      getDashboardFilterSessionMemoryUpdate({
        search: '?tab=overview',
        rememberedDashboardFilterSearch: '',
      }),
    ).toEqual({ type: 'NONE' });
  });

  it('should remember the URL value shown', () => {
    expect(
      getDashboardFilterSessionMemoryUpdate({
        search: `?tab=overview&${THIS_YEAR_SEARCH}`,
        rememberedDashboardFilterSearch: PAST_7_DAYS_SEARCH,
      }),
    ).toEqual({ type: 'REMEMBER', dashboardFilterSearch: THIS_YEAR_SEARCH });
  });

  it('should do nothing when the URL already shows the remembered value', () => {
    expect(
      getDashboardFilterSessionMemoryUpdate({
        search: `?${PAST_7_DAYS_SEARCH}`,
        rememberedDashboardFilterSearch: PAST_7_DAYS_SEARCH,
      }),
    ).toEqual({ type: 'NONE' });
  });

  it('should restore the remembered value into a URL without one, keeping other params', () => {
    expect(
      getDashboardFilterSessionMemoryUpdate({
        search: '?tab=overview',
        rememberedDashboardFilterSearch: PAST_7_DAYS_SEARCH,
      }),
    ).toEqual({
      type: 'RESTORE',
      search: `tab=overview&${PAST_7_DAYS_SEARCH}`,
    });
  });

  it('should replace a malformed URL value with the remembered one, never remember it', () => {
    expect(
      getDashboardFilterSessionMemoryUpdate({
        search: `?${new URLSearchParams([[KEY, 'garbage']]).toString()}`,
        rememberedDashboardFilterSearch: PAST_7_DAYS_SEARCH,
      }),
    ).toEqual({ type: 'RESTORE', search: PAST_7_DAYS_SEARCH });
    expect(
      getDashboardFilterSessionMemoryUpdate({
        search: `?${new URLSearchParams([[KEY, 'garbage']]).toString()}`,
        rememberedDashboardFilterSearch: '',
      }),
    ).toEqual({ type: 'NONE' });
  });
});
