import { type BarChartConfiguration } from '~/generated-metadata/graphql';

// Dashboard filter bindings are resolved into the filter before the configuration is sent, so the data resolvers never read them.
type BarChartNonDataFields =
  | 'dashboardFilterBindings'
  | 'displayDataLabel'
  | 'displayLegend'
  | 'axisNameDisplay'
  | 'description'
  | 'color';

export type BarChartDataConfiguration = Omit<
  BarChartConfiguration,
  BarChartNonDataFields
>;

export const extractBarChartDataConfiguration = (
  configuration: BarChartConfiguration,
): BarChartDataConfiguration => {
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
