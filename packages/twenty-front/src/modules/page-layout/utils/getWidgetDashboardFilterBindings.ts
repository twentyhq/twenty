import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { type DashboardFilterBinding } from 'twenty-shared/types';

export const getWidgetDashboardFilterBindings = (
  configuration: PageLayoutWidget['configuration'],
): DashboardFilterBinding[] =>
  'dashboardFilterBindings' in configuration
    ? (configuration.dashboardFilterBindings ?? []).map(
        ({ pageLayoutFilterId, fieldMetadataId }) => ({
          pageLayoutFilterId,
          fieldMetadataId: fieldMetadataId ?? null,
        }),
      )
    : [];
