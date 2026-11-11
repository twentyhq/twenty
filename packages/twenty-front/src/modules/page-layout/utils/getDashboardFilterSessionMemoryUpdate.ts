import { type DashboardFilterSessionMemoryUpdate } from '@/page-layout/types/DashboardFilterSessionMemoryUpdate';
import { getDashboardFilterSessionSearch } from '@/page-layout/utils/getDashboardFilterSessionSearch';
import { removeDashboardFilterValuesFromSearchParams } from '@/page-layout/utils/removeDashboardFilterValuesFromSearchParams';
import { isNonEmptyString } from '@sniptt/guards';

export const getDashboardFilterSessionMemoryUpdate = ({
  search,
  rememberedDashboardFilterSearch,
}: {
  search: string;
  rememberedDashboardFilterSearch: string;
}): DashboardFilterSessionMemoryUpdate => {
  const searchParams = new URLSearchParams(search);
  const urlDashboardFilterSearch =
    getDashboardFilterSessionSearch(searchParams);

  if (isNonEmptyString(urlDashboardFilterSearch)) {
    return urlDashboardFilterSearch === rememberedDashboardFilterSearch
      ? { type: 'NONE' }
      : { type: 'REMEMBER', dashboardFilterSearch: urlDashboardFilterSearch };
  }

  if (!isNonEmptyString(rememberedDashboardFilterSearch)) {
    return { type: 'NONE' };
  }

  return {
    type: 'RESTORE',
    search: new URLSearchParams([
      ...removeDashboardFilterValuesFromSearchParams(searchParams).entries(),
      ...new URLSearchParams(rememberedDashboardFilterSearch).entries(),
    ]).toString(),
  };
};
