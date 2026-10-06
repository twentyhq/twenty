import { extractBarChartDataConfiguration } from '@/page-layout/widgets/graph/utils/extractBarChartDataConfiguration';
import { extractLineChartDataConfiguration } from '@/page-layout/widgets/graph/utils/extractLineChartDataConfiguration';
import { extractPieChartDataConfiguration } from '@/page-layout/widgets/graph/utils/extractPieChartDataConfiguration';
import { AxisNameDisplay } from '~/generated-metadata/graphql';
import {
  TEST_BAR_CHART_CONFIGURATION,
  TEST_LINE_CHART_CONFIGURATION,
  TEST_PIE_CHART_CONFIGURATION,
} from '~/testing/mock-data/widget-configurations';

const DASHBOARD_FILTER_BINDINGS = {
  'date-slot': { fieldMetadataId: 'created-at' },
};

const STYLE_KEYS = {
  displayDataLabel: true,
  displayLegend: true,
  description: 'Styled',
  color: 'blue',
};

describe('extractBarChartDataConfiguration', () => {
  it('strips dashboard filter bindings and style keys, keeping the data keys', () => {
    const dataConfiguration = extractBarChartDataConfiguration({
      ...TEST_BAR_CHART_CONFIGURATION,
      ...STYLE_KEYS,
      axisNameDisplay: AxisNameDisplay.BOTH,
      dashboardFilterBindings: DASHBOARD_FILTER_BINDINGS,
    });

    expect(dataConfiguration).not.toHaveProperty('dashboardFilterBindings');
    expect(dataConfiguration).not.toHaveProperty('displayDataLabel');
    expect(dataConfiguration).not.toHaveProperty('displayLegend');
    expect(dataConfiguration).not.toHaveProperty('axisNameDisplay');
    expect(dataConfiguration).not.toHaveProperty('description');
    expect(dataConfiguration).not.toHaveProperty('color');
    expect(dataConfiguration).toMatchObject({
      aggregateFieldMetadataId:
        TEST_BAR_CHART_CONFIGURATION.aggregateFieldMetadataId,
      primaryAxisGroupByFieldMetadataId:
        TEST_BAR_CHART_CONFIGURATION.primaryAxisGroupByFieldMetadataId,
      layout: TEST_BAR_CHART_CONFIGURATION.layout,
    });
  });
});

describe('extractLineChartDataConfiguration', () => {
  it('strips dashboard filter bindings and style keys, keeping the data keys', () => {
    const dataConfiguration = extractLineChartDataConfiguration({
      ...TEST_LINE_CHART_CONFIGURATION,
      ...STYLE_KEYS,
      axisNameDisplay: AxisNameDisplay.BOTH,
      dashboardFilterBindings: DASHBOARD_FILTER_BINDINGS,
    });

    expect(dataConfiguration).not.toHaveProperty('dashboardFilterBindings');
    expect(dataConfiguration).not.toHaveProperty('displayDataLabel');
    expect(dataConfiguration).not.toHaveProperty('displayLegend');
    expect(dataConfiguration).not.toHaveProperty('axisNameDisplay');
    expect(dataConfiguration).not.toHaveProperty('description');
    expect(dataConfiguration).not.toHaveProperty('color');
    expect(dataConfiguration).toMatchObject({
      aggregateFieldMetadataId:
        TEST_LINE_CHART_CONFIGURATION.aggregateFieldMetadataId,
      primaryAxisDateGranularity:
        TEST_LINE_CHART_CONFIGURATION.primaryAxisDateGranularity,
    });
  });
});

describe('extractPieChartDataConfiguration', () => {
  it('strips dashboard filter bindings and style keys, keeping the data keys', () => {
    const dataConfiguration = extractPieChartDataConfiguration({
      ...TEST_PIE_CHART_CONFIGURATION,
      ...STYLE_KEYS,
      showCenterMetric: true,
      dashboardFilterBindings: DASHBOARD_FILTER_BINDINGS,
    });

    expect(dataConfiguration).not.toHaveProperty('dashboardFilterBindings');
    expect(dataConfiguration).not.toHaveProperty('displayDataLabel');
    expect(dataConfiguration).not.toHaveProperty('displayLegend');
    expect(dataConfiguration).not.toHaveProperty('showCenterMetric');
    expect(dataConfiguration).not.toHaveProperty('description');
    expect(dataConfiguration).not.toHaveProperty('color');
    expect(dataConfiguration).toMatchObject({
      groupByFieldMetadataId:
        TEST_PIE_CHART_CONFIGURATION.groupByFieldMetadataId,
      orderBy: TEST_PIE_CHART_CONFIGURATION.orderBy,
    });
  });
});
