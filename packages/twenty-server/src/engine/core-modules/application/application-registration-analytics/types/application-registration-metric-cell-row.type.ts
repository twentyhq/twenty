// One (day, metric, dimension, context) cell: the finest granularity any figure is summed from
export type ApplicationRegistrationMetricCellRow = {
  date: string;
  metric: string;
  dimension: string;
  context: string;
  value: string | number;
};
