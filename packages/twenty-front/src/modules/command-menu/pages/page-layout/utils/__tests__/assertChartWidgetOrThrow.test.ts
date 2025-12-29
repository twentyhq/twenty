import { assertChartWidgetOrThrow } from '@/command-menu/pages/page-layout/utils/assertChartWidgetOrThrow';
import {
  ALL_CHART_CONFIGURATIONS,
  createTestWidget,
  TEST_BAR_CHART_CONFIGURATION,
  TEST_IFRAME_CONFIGURATION,
} from '~/testing/mock-data/widget-configurations';

describe('assertChartWidgetOrThrow', () => {
  it('does not throw for valid chart widget', () => {
    const widget = createTestWidget({
      configuration: TEST_BAR_CHART_CONFIGURATION,
    });

    expect(() => assertChartWidgetOrThrow(widget)).not.toThrow();
  });

  it('throws when objectMetadataId is missing', () => {
    const widget = createTestWidget({ objectMetadataId: undefined });

    expect(() => assertChartWidgetOrThrow(widget)).toThrow(
      'Widget objectMetadataId is required',
    );
  });

  it('throws when objectMetadataId is null', () => {
    const widget = createTestWidget({ objectMetadataId: null });

    expect(() => assertChartWidgetOrThrow(widget)).toThrow(
      'Widget objectMetadataId is required',
    );
  });

  it('throws when configuration is not a valid chart type', () => {
    const widget = createTestWidget({
      configuration: TEST_IFRAME_CONFIGURATION,
    });

    expect(() => assertChartWidgetOrThrow(widget)).toThrow(
      'Expected chart configuration but got IframeConfiguration',
    );
  });

  it('passes for all valid chart types', () => {
    ALL_CHART_CONFIGURATIONS.forEach((config) => {
      const widget = createTestWidget({ configuration: config });

      expect(() => assertChartWidgetOrThrow(widget)).not.toThrow();
    });
  });
});
