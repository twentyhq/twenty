import { type DashboardFilterValues } from '@/page-layout/dashboard-filters/types/DashboardFilterValues';
import { getDashboardFilterDefaultValues } from '@/page-layout/dashboard-filters/utils/getDashboardFilterDefaultValues';
import { type DashboardFilterSlot } from 'twenty-shared/types';

// A shared link must open exactly what it shows, so a URL value wins over the slot default; the default only fills slots the URL is silent on.
export const resolveInitialDashboardFilterValues = ({
  slots,
  valuesFromUrl,
}: {
  slots: DashboardFilterSlot[];
  valuesFromUrl: DashboardFilterValues;
}): DashboardFilterValues => ({
  ...getDashboardFilterDefaultValues({ slots }),
  ...valuesFromUrl,
});
