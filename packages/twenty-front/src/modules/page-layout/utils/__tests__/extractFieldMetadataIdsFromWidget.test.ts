import { extractFieldMetadataIdsFromWidget } from '@/page-layout/utils/extractFieldMetadataIdsFromWidget';
import {
  type PageLayoutWidget,
  WidgetType,
} from '~/generated-metadata/graphql';
import { type WidgetConfiguration } from '~/generated/graphql';
import {
  TEST_AGGREGATE_CHART_CONFIGURATION,
  TEST_BAR_CHART_CONFIGURATION,
  TEST_FIELD_METADATA_ID_1,
  TEST_FIELD_METADATA_ID_2,
  TEST_FIELD_METADATA_ID_3,
  TEST_GAUGE_CHART_CONFIGURATION,
  TEST_IFRAME_CONFIGURATION,
  TEST_LINE_CHART_CONFIGURATION,
  TEST_OBJECT_METADATA_ID,
  TEST_PIE_CHART_CONFIGURATION,
} from '~/testing/mock-data/widget-configurations';

const createMockWidget = (
  overrides: Partial<Omit<PageLayoutWidget, 'configuration'>> & {
    configuration: WidgetConfiguration;
  },
): PageLayoutWidget => ({
  id: 'widget-1',
  type: WidgetType.GRAPH,
  title: 'Test',
  objectMetadataId: null,
  gridPosition: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
  pageLayoutTabId: 'tab-1',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  ...overrides,
});

describe('extractFieldMetadataIdsFromWidget', () => {
  it('should return empty array for IFRAME widget', () => {
    const widget = createMockWidget({
      type: WidgetType.IFRAME,
      configuration: TEST_IFRAME_CONFIGURATION,
    });

    expect(extractFieldMetadataIdsFromWidget(widget)).toEqual([]);
  });

  it('should extract field IDs from BarChartConfiguration', () => {
    const widget = createMockWidget({
      configuration: TEST_BAR_CHART_CONFIGURATION,
      objectMetadataId: TEST_OBJECT_METADATA_ID,
    });

    const result = extractFieldMetadataIdsFromWidget(widget);

    expect(result).toHaveLength(2);
    expect(result).toContain(TEST_FIELD_METADATA_ID_1);
    expect(result).toContain(TEST_FIELD_METADATA_ID_2);
  });

  it('should extract field IDs from BarChartConfiguration with optional Y grouping', () => {
    const widget = createMockWidget({
      configuration: {
        ...TEST_BAR_CHART_CONFIGURATION,
        secondaryAxisGroupByFieldMetadataId: TEST_FIELD_METADATA_ID_3,
      },
      objectMetadataId: TEST_OBJECT_METADATA_ID,
    });

    const result = extractFieldMetadataIdsFromWidget(widget);

    expect(result).toHaveLength(3);
    expect(result).toContain(TEST_FIELD_METADATA_ID_1);
    expect(result).toContain(TEST_FIELD_METADATA_ID_2);
    expect(result).toContain(TEST_FIELD_METADATA_ID_3);
  });

  it('should extract field IDs from LineChartConfiguration', () => {
    const widget = createMockWidget({
      configuration: TEST_LINE_CHART_CONFIGURATION,
      objectMetadataId: TEST_OBJECT_METADATA_ID,
    });

    const result = extractFieldMetadataIdsFromWidget(widget);

    expect(result).toHaveLength(2);
    expect(result).toContain(TEST_FIELD_METADATA_ID_1);
    expect(result).toContain(TEST_FIELD_METADATA_ID_2);
  });

  it('should extract field IDs from PieChartConfiguration', () => {
    const widget = createMockWidget({
      configuration: TEST_PIE_CHART_CONFIGURATION,
      objectMetadataId: TEST_OBJECT_METADATA_ID,
    });

    const result = extractFieldMetadataIdsFromWidget(widget);

    expect(result).toHaveLength(2);
    expect(result).toContain(TEST_FIELD_METADATA_ID_1);
    expect(result).toContain(TEST_FIELD_METADATA_ID_2);
  });

  it('should extract field IDs from AggregateChartConfiguration', () => {
    const widget = createMockWidget({
      configuration: TEST_AGGREGATE_CHART_CONFIGURATION,
      objectMetadataId: TEST_OBJECT_METADATA_ID,
    });

    const result = extractFieldMetadataIdsFromWidget(widget);

    expect(result).toHaveLength(1);
    expect(result).toContain(TEST_FIELD_METADATA_ID_1);
  });

  it('should extract field IDs from GaugeChartConfiguration', () => {
    const widget = createMockWidget({
      configuration: TEST_GAUGE_CHART_CONFIGURATION,
      objectMetadataId: TEST_OBJECT_METADATA_ID,
    });

    const result = extractFieldMetadataIdsFromWidget(widget);

    expect(result).toHaveLength(1);
    expect(result).toContain(TEST_FIELD_METADATA_ID_1);
  });

  it('should not include undefined optional fields', () => {
    const widget = createMockWidget({
      configuration: {
        ...TEST_BAR_CHART_CONFIGURATION,
        secondaryAxisGroupByFieldMetadataId: undefined,
      },
      objectMetadataId: TEST_OBJECT_METADATA_ID,
    });

    const result = extractFieldMetadataIdsFromWidget(widget);

    expect(result).toHaveLength(2);
    expect(result).not.toContain(undefined);
  });
});
