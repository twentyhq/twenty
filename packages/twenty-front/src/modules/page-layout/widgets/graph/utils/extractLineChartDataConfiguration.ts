import { type LineChartConfiguration } from '~/generated-metadata/graphql';

// Dashboard filter bindings are resolved into the filter before the configuration is sent, so the data resolvers never read them.
type LineChartNonDataFields =
  | 'dashboardFilterBindings'
  | 'displayDataLabel'
  | 'displayLegend'
  | 'axisNameDisplay'
  | 'description'
  | 'color';

export type LineChartDataConfiguration = Omit<
  LineChartConfiguration,
  LineChartNonDataFields
>;

export const extractLineChartDataConfiguration = (
  configuration: LineChartConfiguration,
): LineChartDataConfiguration => {
  const {
    dashboardFilterBindings: _dashboardFilterBindings,
    displayDataLabel: _displayDataLabel,
    displayLegend: _displayLegend,
    axisNameDisplay: _axisNameDisplay,
    description: _description,
    color: _color,
    ...dataConfiguration
  } = configuration;

  return dataConfiguration;
};
