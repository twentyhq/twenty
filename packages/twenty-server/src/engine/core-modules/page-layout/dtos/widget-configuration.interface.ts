import { createUnionType } from '@nestjs/graphql';

import { BarChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/bar-chart-configuration.dto';
import { GaugeChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/gauge-chart-configuration.dto';
import { IframeConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/iframe-configuration.dto';
import { LineChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/line-chart-configuration.dto';
import { NumberChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/number-chart-configuration.dto';
import { PieChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/pie-chart-configuration.dto';
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

    switch (configuration.configurationType) {
      case WidgetConfigurationType.IFRAME_CONFIG:
        return IframeConfigurationDTO;
      case WidgetConfigurationType.BAR_CHART_CONFIG:
        return BarChartConfigurationDTO;
      case WidgetConfigurationType.LINE_CHART_CONFIG:
        return LineChartConfigurationDTO;
      case WidgetConfigurationType.PIE_CHART_CONFIG:
        return PieChartConfigurationDTO;
      case WidgetConfigurationType.NUMBER_CHART_CONFIG:
        return NumberChartConfigurationDTO;
      case WidgetConfigurationType.GAUGE_CHART_CONFIG:
        return GaugeChartConfigurationDTO;
      default:
        throw new Error(
          `Unknown widget configuration type: ${configuration.configurationType}`,
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
