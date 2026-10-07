import { useInitializeDashboardFilterValues } from '@/page-layout/dashboard-filters/hooks/useInitializeDashboardFilterValues';
import { type DashboardFilterValues } from '@/page-layout/dashboard-filters/types/DashboardFilterValues';
import { type DashboardFilterSlot } from 'twenty-shared/types';

type DashboardFilterDefaultValuesEffectProps = {
  slots: DashboardFilterSlot[];
};

const NO_VALUES_FROM_URL: DashboardFilterValues = {};

// Mounted instead of DashboardFilterUrlSyncEffect on surfaces that do not own the route, so each surface has exactly one initializer and the two never race.
// Each open starts from the slot defaults; what the viewer picked lives only as long as the dashboard stays open.
export const DashboardFilterDefaultValuesEffect = ({
  slots,
}: DashboardFilterDefaultValuesEffectProps) => {
  useInitializeDashboardFilterValues({
    slots,
    valuesFromUrl: NO_VALUES_FROM_URL,
  });

  return null;
};
