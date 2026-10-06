import { type PieChartConfiguration } from '~/generated-metadata/graphql';

// Dashboard filter bindings are resolved into the filter before the configuration is sent, so the data resolvers never read them.
type PieChartNonDataFields =
  | 'dashboardFilterBindings'
  | 'displayDataLabel'
  | 'displayLegend'
  | 'showCenterMetric'
  | 'description'
  | 'color';

export type PieChartDataConfiguration = Omit<
  PieChartConfiguration,
  PieChartNonDataFields
>;

export const extractPieChartDataConfiguration = (
  configuration: PieChartConfiguration,
): PieChartDataConfiguration => {
  const {
    dashboardFilterBindings: _dashboardFilterBindings,
    displayDataLabel: _displayDataLabel,
    displayLegend: _displayLegend,
    showCenterMetric: _showCenterMetric,
    description: _description,
    color: _color,
    ...dataConfiguration
  } = configuration;

  return dataConfiguration;
};
