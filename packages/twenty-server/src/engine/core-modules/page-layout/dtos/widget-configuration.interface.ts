import { createUnionType } from '@nestjs/graphql';

import { BarChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/bar-chart-configuration.dto';
import { GaugeChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/gauge-chart-configuration.dto';
import { IframeConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/iframe-configuration.dto';
import { LineChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/line-chart-configuration.dto';
import { NumberChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/number-chart-configuration.dto';
import { PieChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/pie-chart-configuration.dto';

export const WidgetConfiguration = createUnionType({
  name: 'WidgetConfiguration',
  types: () => [
    BarChartConfigurationDTO,
    LineChartConfigurationDTO,
    PieChartConfigurationDTO,
    NumberChartConfigurationDTO,
    GaugeChartConfigurationDTO,
    IframeConfigurationDTO,
  ],
  resolveType(configuration: Record<string, unknown>) {
    if (!('__typename' in configuration)) {
      throw new Error(
        'Widget configuration missing __typename discriminator. This indicates a validation bug or data corruption.',
      );
    }

    switch (configuration.__typename) {
      case 'IframeConfiguration':
        return IframeConfigurationDTO;
      case 'BarChartConfiguration':
        return BarChartConfigurationDTO;
      case 'LineChartConfiguration':
        return LineChartConfigurationDTO;
      case 'PieChartConfiguration':
        return PieChartConfigurationDTO;
      case 'NumberChartConfiguration':
        return NumberChartConfigurationDTO;
      case 'GaugeChartConfiguration':
        return GaugeChartConfigurationDTO;
      default:
        throw new Error(
          `Unknown widget configuration type: ${configuration.__typename}`,
        );
    }
  },
});

export type WidgetConfigurationInterface =
  | BarChartConfigurationDTO
  | LineChartConfigurationDTO
  | PieChartConfigurationDTO
  | NumberChartConfigurationDTO
  | GaugeChartConfigurationDTO
  | IframeConfigurationDTO;
