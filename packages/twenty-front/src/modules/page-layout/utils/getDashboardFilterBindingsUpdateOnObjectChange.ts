import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isDefined } from 'twenty-shared/utils';
import { type DashboardFilterBinding } from '~/generated-metadata/graphql';

// Field overrides point at the previous object; exclusions still hold
export const getDashboardFilterBindingsUpdateOnObjectChange = (
  configuration: PageLayoutWidget['configuration'] | undefined,
): { dashboardFilterBindings?: DashboardFilterBinding[] } => {
  if (
    !isDefined(configuration) ||
    !('dashboardFilterBindings' in configuration) ||
    !isDefined(configuration.dashboardFilterBindings)
  ) {
    return {};
  }

  const { dashboardFilterBindings } = configuration;
  const exclusions = dashboardFilterBindings.filter(
    ({ fieldMetadataId }) => !isDefined(fieldMetadataId),
  );

  return exclusions.length === dashboardFilterBindings.length
    ? {}
    : { dashboardFilterBindings: exclusions };
};
