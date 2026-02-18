import { type BarChartConfiguration } from '~/generated-metadata/graphql';

type BarChartStyleFields =
  | 'displayDataLabel'
  | 'displayLegend'
  | 'axisNameDisplay'
  | 'description'
  | 'color';

export type BarChartDataConfiguration = Omit<
  BarChartConfiguration,
  BarChartStyleFields
>;

export const extractBarChartDataConfiguration = (
  configuration: BarChartConfiguration,
): BarChartDataConfiguration => {
  const {
    displayDataLabel: _displayDataLabel,
    displayLegend: _displayLegend,
    axisNameDisplay: _axisNameDisplay,
    description: _description,
    color: _color,
    ...dataConfiguration
  } = configuration;

  return dataConfiguration;
};
