import { isChartWidget } from '@/command-menu/pages/page-layout/utils/isChartWidget';
import {
  createTestWidget,
  TEST_BAR_CHART_CONFIGURATION,
  TEST_FIELDS_CONFIGURATION,
  TEST_IFRAME_CONFIGURATION,
  TEST_LINE_CHART_CONFIGURATION,
  TEST_PIE_CHART_CONFIGURATION,
} from '~/testing/mock-data/widget-configurations';

describe('isChartWidget', () => {
  it('returns true for widget with BarChartConfiguration', () => {
    const widget = createTestWidget({
      configuration: TEST_BAR_CHART_CONFIGURATION,
    });

    expect(isChartWidget(widget)).toBe(true);
  });

  it('returns true for widget with LineChartConfiguration', () => {
    const widget = createTestWidget({
      configuration: TEST_LINE_CHART_CONFIGURATION,
    });

    expect(isChartWidget(widget)).toBe(true);
  });

  it('returns true for widget with PieChartConfiguration', () => {
    const widget = createTestWidget({
      configuration: TEST_PIE_CHART_CONFIGURATION,
    });

    expect(isChartWidget(widget)).toBe(true);
  });

  it('returns false for widget with IframeConfiguration', () => {
    const widget = createTestWidget({
      configuration: TEST_IFRAME_CONFIGURATION,
    });

    expect(isChartWidget(widget)).toBe(false);
  });

  it('returns false for widget with FieldsConfiguration', () => {
    const widget = createTestWidget({
      configuration: TEST_FIELDS_CONFIGURATION,
    });

    expect(isChartWidget(widget)).toBe(false);
  });
});
