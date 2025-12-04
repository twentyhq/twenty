import { plainToInstance } from 'class-transformer';
import { validateSync, type ValidationError } from 'class-validator';
import { isDefined } from 'twenty-shared/utils';

import { AggregateChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/aggregate-chart-configuration.dto';
import { transformRichTextV2Value } from 'src/engine/core-modules/record-transformer/utils/transform-rich-text-v2.util';
import { BarChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/bar-chart-configuration.dto';
import { GaugeChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/gauge-chart-configuration.dto';
import { IframeConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/iframe-configuration.dto';
import { LineChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/line-chart-configuration.dto';
import { PieChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/pie-chart-configuration.dto';
import { StandaloneRichTextConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/standalone-rich-text-configuration.dto';
import { type WidgetConfigurationInterface } from 'src/engine/core-modules/page-layout/dtos/widget-configuration.interface';
import { BarChartGroupMode } from 'src/engine/core-modules/page-layout/enums/bar-chart-group-mode.enum';
import { GraphType } from 'src/engine/core-modules/page-layout/enums/graph-type.enum';
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

const validateGraphConfiguration = ({
  configuration,
  isDashboardV2Enabled,
}: {
  configuration: Record<string, unknown>;
  isDashboardV2Enabled: boolean;
}): WidgetConfigurationInterface | null => {
  const graphType = configuration.graphType as GraphType;

  if (!graphType || !Object.values(GraphType).includes(graphType)) {
    return null;
  }

  if (graphType === GraphType.GAUGE && !isDashboardV2Enabled) {
    throw new Error(
      `Chart type ${graphType} requires IS_DASHBOARD_V2_ENABLED feature flag`,
    );
  }

  switch (graphType) {
    case GraphType.VERTICAL_BAR:
    case GraphType.HORIZONTAL_BAR: {
      const instance = plainToInstance(BarChartConfigurationDTO, configuration);

      const errors = validateSync(instance, {
        whitelist: true,
        forbidUnknownValues: true,
      });

      if (errors.length > 0) {
        throw errors;
      }

      if (
        isDefined(instance.secondaryAxisGroupByFieldMetadataId) &&
        !isDefined(instance.groupMode)
      ) {
        instance.groupMode = BarChartGroupMode.STACKED;
      }

      return instance;
    }
    case GraphType.LINE: {
      const instance = plainToInstance(
        LineChartConfigurationDTO,
        configuration,
      );

      const errors = validateSync(instance, {
        whitelist: true,
        forbidUnknownValues: true,
      });

      if (errors.length > 0) {
        throw errors;
      }

      if (
        isDefined(instance.secondaryAxisGroupByFieldMetadataId) &&
        !isDefined(instance.isStacked)
      ) {
        instance.isStacked = true;
      }

      return instance;
    }
    case GraphType.PIE: {
      const instance = plainToInstance(PieChartConfigurationDTO, configuration);

      const errors = validateSync(instance, {
        whitelist: true,
        forbidUnknownValues: true,
      });

      if (errors.length > 0) {
        throw errors;
      }

      return instance;
    }
    case GraphType.AGGREGATE: {
      const instance = plainToInstance(
        AggregateChartConfigurationDTO,
        configuration,
      );

      const errors = validateSync(instance, {
        whitelist: true,
        forbidUnknownValues: true,
      });

      if (errors.length > 0) {
        throw errors;
      }

      return instance;
    }
    case GraphType.GAUGE: {
      const instance = plainToInstance(
        GaugeChartConfigurationDTO,
        configuration,
      );

      const errors = validateSync(instance, {
        whitelist: true,
        forbidUnknownValues: true,
      });

      if (errors.length > 0) {
        throw errors;
      }

      return instance;
    }
    default:
      return null;
  }
};

const validateIframeConfiguration = (
  configuration: unknown,
): WidgetConfigurationInterface | null => {
  const instance = plainToInstance(IframeConfigurationDTO, configuration);

  const errors = validateSync(instance, {
    whitelist: true,
    forbidUnknownValues: true,
  });

  if (errors.length > 0) {
    throw errors;
  }

  return instance;
};

const validateStandaloneRichTextConfiguration = async (
  configuration: unknown,
): Promise<WidgetConfigurationInterface | null> => {
  const instance = plainToInstance(
    StandaloneRichTextConfigurationDTO,
    configuration,
  );

  const errors = validateSync(instance, {
    whitelist: true,
    forbidUnknownValues: true,
  });

  if (errors.length > 0) {
    throw errors;
  }

  if (instance.body) {
    instance.body = await transformRichTextV2Value(instance.body);
  }

  return instance;
};

export const validateAndTransformWidgetConfiguration = async ({
  type,
  configuration,
  isDashboardV2Enabled,
}: {
  type: WidgetType;
  configuration: unknown;
  isDashboardV2Enabled: boolean;
}): Promise<WidgetConfigurationInterface | null> => {
  if (!configuration || typeof configuration !== 'object') {
    throw new Error('Invalid configuration: not an object');
  }

  try {
    switch (type) {
      case WidgetType.GRAPH:
        return validateGraphConfiguration({
          configuration: configuration as Record<string, unknown>,
          isDashboardV2Enabled,
        });
      case WidgetType.IFRAME:
        return validateIframeConfiguration(configuration);
      case WidgetType.STANDALONE_RICH_TEXT:
        return await validateStandaloneRichTextConfiguration(configuration);
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
