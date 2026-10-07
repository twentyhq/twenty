import { useDashboardFilterSlots } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterSlots';
import { hasInitializedDashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/hasInitializedDashboardFilterValuesComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

// Only a dashboard with slots mounts an initializer, so anything else counts as initialized and is never held back.
export const useAreDashboardFilterValuesInitialized = (): boolean => {
  const { slots } = useDashboardFilterSlots();

  const hasInitializedDashboardFilterValues = useAtomComponentStateValue(
    hasInitializedDashboardFilterValuesComponentState,
  );

  return slots.length === 0 || hasInitializedDashboardFilterValues;
};
