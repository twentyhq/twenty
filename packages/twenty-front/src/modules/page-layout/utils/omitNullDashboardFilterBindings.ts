import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isDefined } from 'twenty-shared/utils';

// The fragment reads null for a widget without bindings; sending it back would rewrite every widget's stored JSON
export const omitNullDashboardFilterBindings = (
  configuration: PageLayoutWidget['configuration'],
) => {
  if (
    !('dashboardFilterBindings' in configuration) ||
    isDefined(configuration.dashboardFilterBindings)
  ) {
    return configuration;
  }

  const {
    dashboardFilterBindings: _dashboardFilterBindings,
    ...configurationWithoutDashboardFilterBindings
  } = configuration;

  return configurationWithoutDashboardFilterBindings;
};
