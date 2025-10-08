import { type WidgetConfigurationInterface } from 'src/engine/core-modules/page-layout/dtos/widget-configuration.interface';
import { GraphType } from 'src/engine/core-modules/page-layout/enums/graph-type.enum';
import { WidgetConfigurationType } from 'src/engine/core-modules/page-layout/enums/widget-configuration-type.enum';
import { WidgetType } from 'src/engine/core-modules/page-layout/enums/widget-type.enum';

type ConfigurationWithDiscriminator = WidgetConfigurationInterface & {
  configurationType: WidgetConfigurationType;
};

export const injectWidgetConfigurationDiscriminator = (
  widgetType: WidgetType,
  configuration: WidgetConfigurationInterface | null,
): ConfigurationWithDiscriminator | null => {
  if (!configuration) {
    return null;
  }

  if (widgetType === WidgetType.IFRAME) {
    return {
      ...configuration,
      configurationType: WidgetConfigurationType.IFRAME_CONFIG,
    } as ConfigurationWithDiscriminator;
  }

  if (widgetType === WidgetType.GRAPH && 'graphType' in configuration) {
    switch (configuration.graphType) {
      case GraphType.BAR:
        return {
          ...configuration,
          configurationType: WidgetConfigurationType.BAR_CHART_CONFIG,
        } as ConfigurationWithDiscriminator;
      case GraphType.LINE:
        return {
          ...configuration,
          configurationType: WidgetConfigurationType.LINE_CHART_CONFIG,
        } as ConfigurationWithDiscriminator;
      case GraphType.PIE:
        return {
          ...configuration,
          configurationType: WidgetConfigurationType.PIE_CHART_CONFIG,
        } as ConfigurationWithDiscriminator;
      case GraphType.NUMBER:
        return {
          ...configuration,
          configurationType: WidgetConfigurationType.NUMBER_CHART_CONFIG,
        } as ConfigurationWithDiscriminator;
      case GraphType.GAUGE:
        return {
          ...configuration,
          configurationType: WidgetConfigurationType.GAUGE_CHART_CONFIG,
        } as ConfigurationWithDiscriminator;
      default:
        return configuration as ConfigurationWithDiscriminator;
    }
  }

  return configuration as ConfigurationWithDiscriminator;
};
