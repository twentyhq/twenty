import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { resolveInitialDashboardFilterValues } from '@/page-layout/dashboard-filters/utils/resolveInitialDashboardFilterValues';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useEffect, useState } from 'react';
import { type DashboardFilterSlot } from 'twenty-shared/types';

type DashboardFilterDefaultValuesEffectProps = {
  slots: DashboardFilterSlot[];
};

// Mounted instead of DashboardFilterUrlSyncEffect on surfaces that do not own the route, so each surface has exactly one initializer and the two never race.
export const DashboardFilterDefaultValuesEffect = ({
  slots,
}: DashboardFilterDefaultValuesEffectProps) => {
  const setDashboardFilterValues = useSetAtomComponentState(
    dashboardFilterValuesComponentState,
  );

  const [hasSeededDefaults, setHasSeededDefaults] = useState(false);

  // Seeds once per mount like the URL effect: a default changed in the editor applies on the next open, never over what the viewer picked.
  useEffect(() => {
    if (hasSeededDefaults) {
      return;
    }

    setDashboardFilterValues(
      resolveInitialDashboardFilterValues({ slots, valuesFromUrl: {} }),
    );

    setHasSeededDefaults(true);
  }, [hasSeededDefaults, slots, setDashboardFilterValues]);

  return null;
};
