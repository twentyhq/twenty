import {
  INVALID_IFRAME_CONFIG_BAD_URL,
  TEST_IFRAME_CONFIG,
  TEST_NUMBER_CHART_CONFIG,
} from 'test/integration/constants/widget-configuration-test-data.constants';

import { WidgetType } from 'src/engine/core-modules/page-layout/enums/widget-type.enum';
import { isWidgetConfigurationValid } from 'src/engine/core-modules/page-layout/utils/is-widget-configuration-valid.util';

describe('isWidgetConfigurationValid', () => {
  it('should return true for valid configuration', () => {
    const result = isWidgetConfigurationValid(
      WidgetType.IFRAME,
      TEST_IFRAME_CONFIG,
    );

    expect(result).toBe(true);
  });

  it('should return false for invalid configuration', () => {
    const result = isWidgetConfigurationValid(
      WidgetType.IFRAME,
      INVALID_IFRAME_CONFIG_BAD_URL,
    );

    expect(result).toBe(false);
  });

  it('should return false for null configuration', () => {
    const result = isWidgetConfigurationValid(WidgetType.IFRAME, null);

    expect(result).toBe(false);
  });

  it('should return false for unsupported widget type', () => {
    const result = isWidgetConfigurationValid(
      'UNSUPPORTED' as WidgetType,
      TEST_NUMBER_CHART_CONFIG,
    );

    expect(result).toBe(false);
  });
});
