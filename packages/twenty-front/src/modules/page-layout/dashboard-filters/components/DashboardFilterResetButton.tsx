import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { hasInitializedDashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/hasInitializedDashboardFilterValuesComponentState';
import { areDashboardFilterValuesAtDefaults } from '@/page-layout/dashboard-filters/utils/areDashboardFilterValuesAtDefaults';
import { getDashboardFilterDefaultValues } from '@/page-layout/dashboard-filters/utils/getDashboardFilterDefaultValues';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { type DashboardFilterSlot } from 'twenty-shared/types';
import { LightButton } from 'twenty-ui/components/input';

type DashboardFilterResetButtonProps = {
  slots: DashboardFilterSlot[];
};

// Same affordance as the view bar's Reset: shown only while something differs from the saved state, here the slot defaults.
export const DashboardFilterResetButton = ({
  slots,
}: DashboardFilterResetButtonProps) => {
  const [dashboardFilterValues, setDashboardFilterValues] =
    useAtomComponentState(dashboardFilterValuesComponentState);

  const hasInitializedDashboardFilterValues = useAtomComponentStateValue(
    hasInitializedDashboardFilterValuesComponentState,
  );

  // Before seeding the values are whatever the previous open left, which must not flash a Reset.
  if (
    !hasInitializedDashboardFilterValues ||
    areDashboardFilterValuesAtDefaults({ slots, values: dashboardFilterValues })
  ) {
    return null;
  }

  const handleResetClick = () => {
    setDashboardFilterValues(getDashboardFilterDefaultValues({ slots }));
  };

  return (
    <LightButton
      emphasis="subtle"
      data-testid="dashboard-filter-reset-button"
      onClick={handleResetClick}
    >{t`Reset`}</LightButton>
  );
};
