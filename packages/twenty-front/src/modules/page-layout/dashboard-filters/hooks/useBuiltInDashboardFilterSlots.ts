import { BUILT_IN_DASHBOARD_FILTER_SLOTS } from '@/page-layout/dashboard-filters/constants/BuiltInDashboardFilterSlots';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { type DashboardFilterSlot } from 'twenty-shared/types';

export const useBuiltInDashboardFilterSlots = (): DashboardFilterSlot[] => {
  const { t } = useLingui();

  return useMemo(
    () =>
      BUILT_IN_DASHBOARD_FILTER_SLOTS.map((builtInSlot) => ({
        ...builtInSlot,
        label: t(builtInSlot.label),
      })),
    [t],
  );
};
