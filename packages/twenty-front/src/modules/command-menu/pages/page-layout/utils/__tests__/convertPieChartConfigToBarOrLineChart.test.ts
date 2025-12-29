import { convertPieChartConfigToBarOrLineChart } from '@/command-menu/pages/page-layout/utils/convertPieChartConfigToBarOrLineChart';
import { type PieChartConfiguration } from '~/generated/graphql';
import {
  TEST_BAR_CHART_CONFIGURATION,
  TEST_PIE_CHART_CONFIGURATION,
} from '~/testing/mock-data/widget-configurations';

describe('convertPieChartConfigToBarOrLineChart', () => {
  it('maps pie chart fields to bar/line chart equivalents', () => {
    const result = convertPieChartConfigToBarOrLineChart(
      TEST_PIE_CHART_CONFIGURATION,
    );

    expect(result).toEqual({
      primaryAxisGroupByFieldMetadataId:
        TEST_PIE_CHART_CONFIGURATION.groupByFieldMetadataId,
      primaryAxisGroupBySubFieldName:
        TEST_PIE_CHART_CONFIGURATION.groupBySubFieldName,
      primaryAxisDateGranularity: TEST_PIE_CHART_CONFIGURATION.dateGranularity,
      primaryAxisOrderBy: TEST_PIE_CHART_CONFIGURATION.orderBy,
    });
  });

  it('handles null/undefined fields', () => {
    const minimalPieConfig: PieChartConfiguration = {
      ...TEST_PIE_CHART_CONFIGURATION,
      groupByFieldMetadataId: undefined as unknown as string,
      groupBySubFieldName: null,
      dateGranularity: null,
      orderBy: null,
    };

    const result = convertPieChartConfigToBarOrLineChart(minimalPieConfig);

    expect(result).toEqual({
      primaryAxisGroupByFieldMetadataId: undefined,
      primaryAxisGroupBySubFieldName: null,
      primaryAxisDateGranularity: null,
      primaryAxisOrderBy: null,
    });
  });

  it('returns empty object for non-pie chart configuration', () => {
    const result = convertPieChartConfigToBarOrLineChart(
      TEST_BAR_CHART_CONFIGURATION as unknown as PieChartConfiguration,
    );

    expect(result).toEqual({});
  });
});
