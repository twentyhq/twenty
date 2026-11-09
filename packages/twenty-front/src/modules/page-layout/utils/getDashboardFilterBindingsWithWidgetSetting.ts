import { DASHBOARD_FILTER_DEFAULT_OPTION_VALUE } from '@/page-layout/constants/DashboardFilterDefaultOptionValue';
import { DASHBOARD_FILTER_IGNORED_OPTION_VALUE } from '@/page-layout/constants/DashboardFilterIgnoredOptionValue';
import { type DashboardFilterBinding } from 'twenty-shared/types';

export const getDashboardFilterBindingsWithWidgetSetting = ({
  dashboardFilterBindings,
  pageLayoutFilterId,
  value,
}: {
  dashboardFilterBindings: DashboardFilterBinding[];
  pageLayoutFilterId: string;
  value: string;
}): DashboardFilterBinding[] => {
  const otherDashboardFilterBindings = dashboardFilterBindings.filter(
    (binding) => binding.pageLayoutFilterId !== pageLayoutFilterId,
  );

  if (value === DASHBOARD_FILTER_DEFAULT_OPTION_VALUE) {
    return otherDashboardFilterBindings;
  }

  return [
    ...otherDashboardFilterBindings,
    {
      pageLayoutFilterId,
      fieldMetadataId:
        value === DASHBOARD_FILTER_IGNORED_OPTION_VALUE ? null : value,
    },
  ];
};
