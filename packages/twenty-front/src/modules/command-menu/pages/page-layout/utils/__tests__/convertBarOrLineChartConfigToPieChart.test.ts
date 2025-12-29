import { convertBarOrLineChartConfigToPieChart } from '@/command-menu/pages/page-layout/utils/convertBarOrLineChartConfigToPieChart';
import { type BarChartConfiguration } from '~/generated/graphql';
import {
  TEST_BAR_CHART_CONFIGURATION,
  TEST_LINE_CHART_CONFIGURATION,
  TEST_PIE_CHART_CONFIGURATION,
} from '~/testing/mock-data/widget-configurations';

describe('convertBarOrLineChartConfigToPieChart', () => {
  it('maps bar chart fields to pie chart equivalents', () => {
    const result = convertBarOrLineChartConfigToPieChart(
      TEST_BAR_CHART_CONFIGURATION,
    );

    expect(result).toEqual({
      groupByFieldMetadataId:
        TEST_BAR_CHART_CONFIGURATION.primaryAxisGroupByFieldMetadataId,
      groupBySubFieldName:
        TEST_BAR_CHART_CONFIGURATION.primaryAxisGroupBySubFieldName,
      dateGranularity: TEST_BAR_CHART_CONFIGURATION.primaryAxisDateGranularity,
      orderBy: TEST_BAR_CHART_CONFIGURATION.primaryAxisOrderBy,
    });
  });

  it('maps line chart fields to pie chart equivalents', () => {
    const result = convertBarOrLineChartConfigToPieChart(
      TEST_LINE_CHART_CONFIGURATION,
    );

    expect(result).toEqual({
      groupByFieldMetadataId:
        TEST_LINE_CHART_CONFIGURATION.primaryAxisGroupByFieldMetadataId,
      groupBySubFieldName:
        TEST_LINE_CHART_CONFIGURATION.primaryAxisGroupBySubFieldName,
      dateGranularity: TEST_LINE_CHART_CONFIGURATION.primaryAxisDateGranularity,
      orderBy: TEST_LINE_CHART_CONFIGURATION.primaryAxisOrderBy,
    });
  });

  it('returns empty object for non-bar/line chart configuration', () => {
    const result = convertBarOrLineChartConfigToPieChart(
      TEST_PIE_CHART_CONFIGURATION as unknown as BarChartConfiguration,
    );

    expect(result).toEqual({});
  });
});
