import { convertBarOrLineChartConfigToPieChart } from '@/side-panel/pages/page-layout/utils/convertBarOrLineChartConfigToPieChart';
import {
  TEST_BAR_CHART_CONFIGURATION,
  TEST_LINE_CHART_CONFIGURATION,
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
      splitMultiValueFields: TEST_BAR_CHART_CONFIGURATION.splitMultiValueFields,
      aggregateFieldMetadataId:
        TEST_BAR_CHART_CONFIGURATION.aggregateFieldMetadataId,
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
      splitMultiValueFields:
        TEST_LINE_CHART_CONFIGURATION.splitMultiValueFields,
      aggregateFieldMetadataId:
        TEST_LINE_CHART_CONFIGURATION.aggregateFieldMetadataId,
    });
  });
});
