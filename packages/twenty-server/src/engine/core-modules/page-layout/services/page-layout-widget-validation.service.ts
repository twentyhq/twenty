import { Injectable, Logger } from '@nestjs/common';

import { plainToInstance } from 'class-transformer';
import { validateOrReject, ValidationError } from 'class-validator';

import { WidgetType } from 'src/engine/core-modules/page-layout/enums/widget-type.enum';
import { GraphType } from 'src/engine/core-modules/page-layout/enums/graph-type.enum';
import { WidgetConfigurationInterface } from 'src/engine/core-modules/page-layout/dtos/widget-configuration.interface';
import { BarChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/bar-chart-configuration.dto';
import { LineChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/line-chart-configuration.dto';
import { PieChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/pie-chart-configuration.dto';
import { NumberChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/number-chart-configuration.dto';
import { GaugeChartConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/gauge-chart-configuration.dto';
import { IframeConfigurationDTO } from 'src/engine/core-modules/page-layout/dtos/iframe-configuration.dto';

@Injectable()
export class PageLayoutWidgetValidationService {
  private readonly logger = new Logger(PageLayoutWidgetValidationService.name);

  async validateWidgetConfiguration(
    type: WidgetType,
    configuration: unknown,
  ): Promise<WidgetConfigurationInterface | null> {
    if (!configuration || typeof configuration !== 'object') {
      this.logger.warn(`Invalid configuration: not an object`);

      return null;
    }

    try {
      switch (type) {
        case WidgetType.GRAPH:
          return await this.validateGraphConfiguration(
            configuration as Record<string, unknown>,
          );
        case WidgetType.IFRAME:
          return await this.validateIframeConfiguration(configuration);
        default:
          this.logger.warn(`Unsupported widget type: ${type}`);

          return null;
      }
    } catch (error) {
      const errorMessage = this.formatValidationErrors(error);

      this.logger.warn(
        `Widget configuration validation failed: ${errorMessage}`,
      );

      return null;
    }
  }

  private async validateGraphConfiguration(
    configuration: Record<string, unknown>,
  ): Promise<WidgetConfigurationInterface | null> {
    const graphType = configuration.graphType as GraphType;

    if (!graphType || !Object.values(GraphType).includes(graphType)) {
      this.logger.warn(`Invalid or missing graphType: ${graphType}`);

      return null;
    }

    switch (graphType) {
      case GraphType.BAR: {
        const instance = plainToInstance(
          BarChartConfigurationDTO,
          configuration,
        );

        await validateOrReject(instance);

        return instance;
      }
      case GraphType.LINE: {
        const instance = plainToInstance(
          LineChartConfigurationDTO,
          configuration,
        );

        await validateOrReject(instance);

        return instance;
      }
      case GraphType.PIE: {
        const instance = plainToInstance(
          PieChartConfigurationDTO,
          configuration,
        );

        await validateOrReject(instance);

        return instance;
      }
      case GraphType.NUMBER: {
        const instance = plainToInstance(
          NumberChartConfigurationDTO,
          configuration,
        );

        await validateOrReject(instance);

        return instance;
      }
      case GraphType.GAUGE: {
        const instance = plainToInstance(
          GaugeChartConfigurationDTO,
          configuration,
        );

        await validateOrReject(instance);

        return instance;
      }
      default:
        this.logger.warn(`Unsupported graph type: ${graphType}`);

        return null;
    }
  }

  private async validateIframeConfiguration(
    configuration: unknown,
  ): Promise<WidgetConfigurationInterface | null> {
    const instance = plainToInstance(IframeConfigurationDTO, configuration);

    await validateOrReject(instance);

    return instance;
  }

  private formatValidationErrors(error: unknown): string {
    if (Array.isArray(error)) {
      return error
        .map((err: ValidationError) => {
          const constraints = err.constraints
            ? Object.values(err.constraints).join(', ')
            : 'Unknown error';

          return `${err.property}: ${constraints}`;
        })
        .join('; ');
    }
    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }
}
