import { createUnionType } from '@nestjs/graphql';

import { BarChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/bar-chart-configuration.dto';
import { GaugeChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/gauge-chart-configuration.dto';
import { IframeConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/iframe-configuration.dto';
import { LineChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/line-chart-configuration.dto';
import { NumberChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/number-chart-configuration.dto';
import { PieChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/pie-chart-configuration.dto';
import { GraphType } from 'src/engine/core-modules/page-layout/enums/graph-type.enum';

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
    // Check for iframe configuration
    if ('url' in configuration && configuration.url) {
      return IframeConfigurationDTO;
    }

    // Check for graph configurations
    if ('graphType' in configuration && configuration.graphType) {
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
      }
    }

    throw new Error('Unable to resolve widget configuration type');
  },
});

// Export TypeScript type for use in services
export type WidgetConfigurationInterface =
  | BarChartConfigurationDTO
  | LineChartConfigurationDTO
  | PieChartConfigurationDTO
  | NumberChartConfigurationDTO
  | GaugeChartConfigurationDTO
  | IframeConfigurationDTO;
