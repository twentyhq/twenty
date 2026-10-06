import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import { areDashboardFilterValuesAtDefaults } from '@/page-layout/dashboard-filters/utils/areDashboardFilterValuesAtDefaults';
import { getDashboardFilterDefaultValues } from '@/page-layout/dashboard-filters/utils/getDashboardFilterDefaultValues';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
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

  if (
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
