import { type ApplicationRegistrationMetricRowWithWorkspaceCount } from 'src/engine/core-modules/application/application-registration-analytics/types/application-registration-metric-row-with-workspace-count.type';

// One (day, metric, dimension, context) cell: the finest granularity any published figure is summed from
export type ApplicationRegistrationMetricCellRow =
  ApplicationRegistrationMetricRowWithWorkspaceCount & {
    date: string;
    metric: string;
    dimension: string;
    context: string;
    value: string | number;
  };
