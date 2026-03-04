import { isWidgetConfigurationOfTypeGraph } from '@/command-menu/pages/page-layout/utils/isWidgetConfigurationOfTypeGraph';
import {
  ALL_CHART_CONFIGURATIONS,
  TEST_FIELDS_CONFIGURATION,
  TEST_IFRAME_CONFIGURATION,
  TEST_STANDALONE_RICH_TEXT_CONFIGURATION,
} from '~/testing/mock-data/widget-configurations';

describe('isWidgetConfigurationOfTypeGraph', () => {
  it('returns true for all chart configurations', () => {
    ALL_CHART_CONFIGURATIONS.forEach((config) => {
      expect(isWidgetConfigurationOfTypeGraph(config)).toBe(true);
    });
  });

  it('returns false for IframeConfiguration', () => {
    expect(isWidgetConfigurationOfTypeGraph(TEST_IFRAME_CONFIGURATION)).toBe(
      false,
    );
  });

  it('returns false for StandaloneRichTextConfiguration', () => {
    expect(
      isWidgetConfigurationOfTypeGraph(TEST_STANDALONE_RICH_TEXT_CONFIGURATION),
    ).toBe(false);
  });

  it('returns false for FieldsConfiguration', () => {
    expect(isWidgetConfigurationOfTypeGraph(TEST_FIELDS_CONFIGURATION)).toBe(
      false,
    );
  });

  it('returns false for null', () => {
    expect(isWidgetConfigurationOfTypeGraph(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isWidgetConfigurationOfTypeGraph(undefined)).toBe(false);
  });
});
