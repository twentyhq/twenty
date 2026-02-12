import { type PieChartConfiguration } from '~/generated-metadata/graphql';

type PieChartStyleFields =
  | 'displayDataLabel'
  | 'displayLegend'
  | 'showCenterMetric'
  | 'description'
  | 'color';

export type PieChartDataConfiguration = Omit<
  PieChartConfiguration,
  PieChartStyleFields
>;

export const extractPieChartDataConfiguration = (
  configuration: PieChartConfiguration,
): PieChartDataConfiguration => {
  const {
    displayDataLabel: _displayDataLabel,
    displayLegend: _displayLegend,
    showCenterMetric: _showCenterMetric,
    description: _description,
    color: _color,
    ...dataConfiguration
  } = configuration;

  return dataConfiguration;
};
