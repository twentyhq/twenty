import { plainToInstance } from 'class-transformer';
import { validateSync, type ValidationError } from 'class-validator';

import { BarChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/bar-chart-configuration.dto';
import { GaugeChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/gauge-chart-configuration.dto';
import { IframeConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/iframe-configuration.dto';
import { LineChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/line-chart-configuration.dto';
import { NumberChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/number-chart-configuration.dto';
import { PieChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/pie-chart-configuration.dto';
import { type WidgetConfigurationInterface } from 'src/engine/core-modules/page-layout/dtos/widget-configuration.interface';
import { GraphType } from 'src/engine/core-modules/page-layout/enums/graph-type.enum';
import { WidgetConfigurationType } from 'src/engine/core-modules/page-layout/enums/widget-configuration-type.enum';
import { WidgetType } from 'src/engine/core-modules/page-layout/enums/widget-type.enum';

const formatValidationErrors = (errors: ValidationError[]): string => {
  return errors
    .map((err) => {
      const constraints = err.constraints
        ? Object.values(err.constraints).join(', ')
        : 'Unknown error';

      return `${err.property}: ${constraints}`;
    })
    .join('; ');
};

const validateGraphConfiguration = (
  configuration: Record<string, unknown>,
): WidgetConfigurationInterface | null => {
  const graphType = configuration.graphType as GraphType;

  if (!graphType || !Object.values(GraphType).includes(graphType)) {
    return null;
  }

  switch (graphType) {
    case GraphType.BAR: {
      const instance = plainToInstance(BarChartConfigurationDTO, configuration);

      const errors = validateSync(instance);

      if (errors.length > 0) {
        throw errors;
      }

      return {
        ...instance,
        configurationType: WidgetConfigurationType.BAR_CHART_CONFIG,
      } as WidgetConfigurationInterface;
    }
    case GraphType.LINE: {
      const instance = plainToInstance(
        LineChartConfigurationDTO,
        configuration,
      );

      const errors = validateSync(instance);

      if (errors.length > 0) {
        throw errors;
      }

      return {
        ...instance,
        configurationType: WidgetConfigurationType.LINE_CHART_CONFIG,
      } as WidgetConfigurationInterface;
    }
    case GraphType.PIE: {
      const instance = plainToInstance(PieChartConfigurationDTO, configuration);

      const errors = validateSync(instance);

      if (errors.length > 0) {
        throw errors;
      }

      return {
        ...instance,
        configurationType: WidgetConfigurationType.PIE_CHART_CONFIG,
      } as WidgetConfigurationInterface;
    }
    case GraphType.NUMBER: {
      const instance = plainToInstance(
        NumberChartConfigurationDTO,
        configuration,
      );

      const errors = validateSync(instance);

      if (errors.length > 0) {
        throw errors;
      }

      return {
        ...instance,
        configurationType: WidgetConfigurationType.NUMBER_CHART_CONFIG,
      } as WidgetConfigurationInterface;
    }
    case GraphType.GAUGE: {
      const instance = plainToInstance(
        GaugeChartConfigurationDTO,
        configuration,
      );

      const errors = validateSync(instance);

      if (errors.length > 0) {
        throw errors;
      }

      return {
        ...instance,
        configurationType: WidgetConfigurationType.GAUGE_CHART_CONFIG,
      } as WidgetConfigurationInterface;
    }
    default:
      return null;
  }
};

const validateIframeConfiguration = (
  configuration: unknown,
): WidgetConfigurationInterface | null => {
  const instance = plainToInstance(IframeConfigurationDTO, configuration);

  const errors = validateSync(instance);

  if (errors.length > 0) {
    throw errors;
  }

  return {
    ...instance,
    configurationType: WidgetConfigurationType.IFRAME_CONFIG,
  } as WidgetConfigurationInterface;
};

export const validateAndTransformWidgetConfiguration = (
  type: WidgetType,
  configuration: unknown,
): WidgetConfigurationInterface | null => {
  if (!configuration || typeof configuration !== 'object') {
    throw new Error('Invalid configuration: not an object');
  }

  try {
    switch (type) {
      case WidgetType.GRAPH:
        return validateGraphConfiguration(
          configuration as Record<string, unknown>,
        );
      case WidgetType.IFRAME:
        return validateIframeConfiguration(configuration);
      default:
        return null;
    }
  } catch (error) {
    if (Array.isArray(error)) {
      const errorMessage = formatValidationErrors(error);

      throw new Error(errorMessage);
    }
    throw error;
  }
};
