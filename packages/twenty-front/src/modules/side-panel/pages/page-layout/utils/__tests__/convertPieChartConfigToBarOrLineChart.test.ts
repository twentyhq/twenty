import { convertPieChartConfigToBarOrLineChart } from '@/side-panel/pages/page-layout/utils/convertPieChartConfigToBarOrLineChart';
import { type PieChartConfiguration } from '~/generated-metadata/graphql';
import { TEST_PIE_CHART_CONFIGURATION } from '~/testing/mock-data/widget-configurations';

describe('convertPieChartConfigToBarOrLineChart', () => {
  it('maps pie chart fields to bar/line chart equivalents', () => {
    const result = convertPieChartConfigToBarOrLineChart(
      TEST_PIE_CHART_CONFIGURATION,
    );

    expect(result).toEqual({
      aggregateFieldMetadataId:
        TEST_PIE_CHART_CONFIGURATION.aggregateFieldMetadataId,
      primaryAxisGroupByFieldMetadataId:
        TEST_PIE_CHART_CONFIGURATION.groupByFieldMetadataId,
      primaryAxisGroupBySubFieldName:
        TEST_PIE_CHART_CONFIGURATION.groupBySubFieldName,
      primaryAxisDateGranularity: TEST_PIE_CHART_CONFIGURATION.dateGranularity,
      primaryAxisOrderBy: TEST_PIE_CHART_CONFIGURATION.orderBy,
      splitMultiValueFields: TEST_PIE_CHART_CONFIGURATION.splitMultiValueFields,
    });
  });

  it('handles null fields', () => {
    const minimalPieConfig: PieChartConfiguration = {
      ...TEST_PIE_CHART_CONFIGURATION,
      groupBySubFieldName: null,
      dateGranularity: null,
      orderBy: null,
    };

    const result = convertPieChartConfigToBarOrLineChart(minimalPieConfig);

    expect(result).toEqual({
      aggregateFieldMetadataId:
        TEST_PIE_CHART_CONFIGURATION.aggregateFieldMetadataId,
      primaryAxisGroupByFieldMetadataId:
        TEST_PIE_CHART_CONFIGURATION.groupByFieldMetadataId,
      primaryAxisGroupBySubFieldName: null,
      primaryAxisDateGranularity: null,
      primaryAxisOrderBy: null,
      splitMultiValueFields: TEST_PIE_CHART_CONFIGURATION.splitMultiValueFields,
    });
  });
});
