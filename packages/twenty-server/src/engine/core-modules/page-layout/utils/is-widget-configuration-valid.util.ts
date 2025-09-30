import { type WidgetType } from 'src/engine/core-modules/page-layout/enums/widget-type.enum';
import { validateAndTransformWidgetConfiguration } from 'src/engine/core-modules/page-layout/utils/validate-and-transform-widget-configuration.util';

export const isWidgetConfigurationValid = (
  type: WidgetType,
  configuration: unknown,
): boolean => {
  try {
    const validatedConfig = validateAndTransformWidgetConfiguration(
      type,
      configuration,
    );

    return validatedConfig !== null;
  } catch {
    return false;
  }
};
