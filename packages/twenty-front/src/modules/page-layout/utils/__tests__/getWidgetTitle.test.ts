import { getWidgetTitle } from '@/page-layout/utils/getWidgetTitle';
import {
  TEST_AGGREGATE_CHART_CONFIGURATION,
  TEST_BAR_CHART_CONFIGURATION,
  TEST_BAR_CHART_CONFIGURATION_HORIZONTAL,
  TEST_GAUGE_CHART_CONFIGURATION,
  TEST_IFRAME_CONFIGURATION,
  TEST_LINE_CHART_CONFIGURATION,
  TEST_PIE_CHART_CONFIGURATION,
  TEST_STANDALONE_RICH_TEXT_CONFIGURATION,
} from '~/testing/mock-data/widget-configurations';

describe('getWidgetTitle', () => {
  it('returns correct title for aggregate chart', () => {
    const result = getWidgetTitle(TEST_AGGREGATE_CHART_CONFIGURATION, 0);

    expect(result).toBe('Aggregate Chart 1');
  });

  it('returns correct title for gauge chart', () => {
    const result = getWidgetTitle(TEST_GAUGE_CHART_CONFIGURATION, 2);

    expect(result).toBe('Gauge Chart 3');
  });

  it('returns correct title for pie chart', () => {
    const result = getWidgetTitle(TEST_PIE_CHART_CONFIGURATION, 0);

    expect(result).toBe('Pie Chart 1');
  });

  it('returns correct title for vertical bar chart', () => {
    const result = getWidgetTitle(TEST_BAR_CHART_CONFIGURATION, 0);

    expect(result).toBe('Vertical Bar Chart 1');
  });

  it('returns correct title for horizontal bar chart', () => {
    const result = getWidgetTitle(TEST_BAR_CHART_CONFIGURATION_HORIZONTAL, 1);

    expect(result).toBe('Horizontal Bar Chart 2');
  });

  it('returns correct title for line chart', () => {
    const result = getWidgetTitle(TEST_LINE_CHART_CONFIGURATION, 0);

    expect(result).toBe('Line Chart 1');
  });

  it('returns correct title for iframe', () => {
    const result = getWidgetTitle(TEST_IFRAME_CONFIGURATION, 0);

    expect(result).toBe('Iframe 1');
  });

  it('returns correct title for standalone rich text', () => {
    const result = getWidgetTitle(TEST_STANDALONE_RICH_TEXT_CONFIGURATION, 4);

    expect(result).toBe('Rich Text 5');
  });
});
