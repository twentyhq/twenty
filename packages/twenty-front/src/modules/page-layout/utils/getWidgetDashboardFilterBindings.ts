import { type DashboardFilterWidgetConfiguration } from '@/page-layout/types/DashboardFilterWidgetConfiguration';
import { type DashboardFilterBinding } from 'twenty-shared/types';

export const getWidgetDashboardFilterBindings = (
  configuration: DashboardFilterWidgetConfiguration,
): DashboardFilterBinding[] =>
  (configuration.dashboardFilterBindings ?? []).map(
    ({ pageLayoutFilterId, fieldMetadataId }) => ({
      pageLayoutFilterId,
      fieldMetadataId: fieldMetadataId ?? null,
    }),
  );
