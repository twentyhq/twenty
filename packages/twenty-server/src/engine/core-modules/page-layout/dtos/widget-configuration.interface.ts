import { createUnionType } from '@nestjs/graphql';

import { BarChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/bar-chart-configuration.dto';
import { GaugeChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/gauge-chart-configuration.dto';
import { IframeConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/iframe-configuration.dto';
import { LineChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/line-chart-configuration.dto';
import { NumberChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/number-chart-configuration.dto';
import { PieChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/pie-chart-configuration.dto';
import { GraphType } from 'src/engine/core-modules/page-layout/enums/graph-type.enum';
import { WidgetConfigurationType } from 'src/engine/core-modules/page-layout/enums/widget-configuration-type.enum';

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
    if (!('configurationType' in configuration)) {
      throw new Error(
        'Widget configuration missing configurationType discriminator. This indicates a validation bug or data corruption.',
      );
    }

    if (
      configuration.configurationType === WidgetConfigurationType.CHART_CONFIG
    ) {
      switch (configuration.graphType) {
        case GraphType.BAR:
          return BarChartConfigurationDTO;
        case GraphType.LINE:
          return LineChartConfigurationDTO;
        case GraphType.PIE:
          return PieChartConfigurationDTO;
        case GraphType.NUMBER:
          return NumberChartConfigurationDTO;
        case GraphType.GAUGE:
          return GaugeChartConfigurationDTO;
        default:
          throw new Error(`Unknown graph type: ${configuration.graphType}`);
      }
    }

    if (
      configuration.configurationType === WidgetConfigurationType.IFRAME_CONFIG
    ) {
      return IframeConfigurationDTO;
    }

    throw new Error(
      `Unknown widget configuration type: ${configuration.configurationType}`,
    );
  },
});

export type WidgetConfigurationInterface =
  | BarChartConfigurationDTO
  | LineChartConfigurationDTO
  | PieChartConfigurationDTO
  | NumberChartConfigurationDTO
  | GaugeChartConfigurationDTO
  | IframeConfigurationDTO;
