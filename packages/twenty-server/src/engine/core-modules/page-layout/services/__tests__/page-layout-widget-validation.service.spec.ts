import { Test, TestingModule } from '@nestjs/testing';

import { PageLayoutWidgetValidationService } from 'src/engine/core-modules/page-layout/services/page-layout-widget-validation.service';
import { WidgetType } from 'src/engine/core-modules/page-layout/enums/widget-type.enum';
import { GraphType } from 'src/engine/core-modules/page-layout/enums/graph-type.enum';
import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { GraphOrderBy } from 'src/engine/core-modules/page-layout/enums/graph-order-by.enum';
import {
  TEST_IFRAME_CONFIG,
  TEST_NUMBER_CHART_CONFIG,
  TEST_BAR_CHART_CONFIG,
  TEST_LINE_CHART_CONFIG,
  TEST_PIE_CHART_CONFIG,
  TEST_GAUGE_CHART_CONFIG,
  INVALID_IFRAME_CONFIG_BAD_URL,
  INVALID_IFRAME_CONFIG_MISSING_URL,
  INVALID_IFRAME_CONFIG_EMPTY_URL,
  INVALID_NUMBER_CHART_CONFIG_MISSING_FIELDS,
  INVALID_NUMBER_CHART_CONFIG_BAD_UUID,
  INVALID_BAR_CHART_CONFIG_MISSING_GROUP_BY,
  TEST_FIELD_METADATA_ID_1,
  TEST_FIELD_METADATA_ID_2,
} from 'test/integration/constants/widget-configuration-test-data.constants';

describe('PageLayoutWidgetValidationService', () => {
  let service: PageLayoutWidgetValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PageLayoutWidgetValidationService],
    }).compile();

    service = module.get<PageLayoutWidgetValidationService>(
      PageLayoutWidgetValidationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateWidgetConfiguration', () => {
    describe('IframeConfiguration validation', () => {
      it('should validate a valid IframeConfiguration', async () => {
        const result = await service.validateWidgetConfiguration(
          WidgetType.IFRAME,
          TEST_IFRAME_CONFIG,
        );

        expect(result).toBeDefined();
        expect(result).toMatchObject(TEST_IFRAME_CONFIG);
      });

      it('should return null for invalid URL in IframeConfiguration', async () => {
        const result = await service.validateWidgetConfiguration(
          WidgetType.IFRAME,
          INVALID_IFRAME_CONFIG_BAD_URL,
        );

        expect(result).toBeNull();
      });

      it('should return null for missing URL in IframeConfiguration', async () => {
        const result = await service.validateWidgetConfiguration(
          WidgetType.IFRAME,
          INVALID_IFRAME_CONFIG_MISSING_URL,
        );

        expect(result).toBeNull();
      });

      it('should return null for empty URL in IframeConfiguration', async () => {
        const result = await service.validateWidgetConfiguration(
          WidgetType.IFRAME,
          INVALID_IFRAME_CONFIG_EMPTY_URL,
        );

        expect(result).toBeNull();
      });
    });

    describe('NumberChartConfiguration validation', () => {
      it('should validate a valid NumberChartConfiguration', async () => {
        const result = await service.validateWidgetConfiguration(
          WidgetType.GRAPH,
          TEST_NUMBER_CHART_CONFIG,
        );

        expect(result).toBeDefined();
        expect(result).toMatchObject(TEST_NUMBER_CHART_CONFIG);
      });

      it('should validate a minimal NumberChartConfiguration', async () => {
        const minimalConfig = {
          graphType: GraphType.NUMBER,
          aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
          aggregateOperation: AggregateOperations.COUNT,
        };

        const result = await service.validateWidgetConfiguration(
          WidgetType.GRAPH,
          minimalConfig,
        );

        expect(result).toBeDefined();
        expect(result).toMatchObject(minimalConfig);
      });

      it('should return null for NumberChartConfiguration missing required fields', async () => {
        const result = await service.validateWidgetConfiguration(
          WidgetType.GRAPH,
          INVALID_NUMBER_CHART_CONFIG_MISSING_FIELDS,
        );

        expect(result).toBeNull();
      });

      it('should return null for NumberChartConfiguration with invalid UUID', async () => {
        const result = await service.validateWidgetConfiguration(
          WidgetType.GRAPH,
          INVALID_NUMBER_CHART_CONFIG_BAD_UUID,
        );

        expect(result).toBeNull();
      });

      it('should return null for NumberChartConfiguration with invalid aggregate operation', async () => {
        const invalidConfig = {
          graphType: GraphType.NUMBER,
          aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
          aggregateOperation: 'INVALID_OPERATION',
        };

        const result = await service.validateWidgetConfiguration(
          WidgetType.GRAPH,
          invalidConfig,
        );

        expect(result).toBeNull();
      });
    });

    describe('BarChartConfiguration validation', () => {
      it('should validate a valid BarChartConfiguration', async () => {
        const result = await service.validateWidgetConfiguration(
          WidgetType.GRAPH,
          TEST_BAR_CHART_CONFIG,
        );

        expect(result).toBeDefined();
        expect(result).toMatchObject(TEST_BAR_CHART_CONFIG);
      });

      it('should validate a minimal BarChartConfiguration', async () => {
        const minimalConfig = {
          graphType: GraphType.BAR,
          aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
          aggregateOperation: AggregateOperations.SUM,
          groupByFieldMetadataIdX: TEST_FIELD_METADATA_ID_2,
          orderByX: GraphOrderBy.FIELD_ASC,
        };

        const result = await service.validateWidgetConfiguration(
          WidgetType.GRAPH,
          minimalConfig,
        );

        expect(result).toBeDefined();
        expect(result).toMatchObject(minimalConfig);
      });

      it('should return null for BarChartConfiguration missing groupBy field', async () => {
        const result = await service.validateWidgetConfiguration(
          WidgetType.GRAPH,
          INVALID_BAR_CHART_CONFIG_MISSING_GROUP_BY,
        );

        expect(result).toBeNull();
      });

      it('should return null for BarChartConfiguration with invalid orderBy', async () => {
        const invalidConfig = {
          graphType: GraphType.BAR,
          aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
          aggregateOperation: AggregateOperations.SUM,
          groupByFieldMetadataIdX: TEST_FIELD_METADATA_ID_2,
          orderByX: 'INVALID_ORDER',
        };

        const result = await service.validateWidgetConfiguration(
          WidgetType.GRAPH,
          invalidConfig,
        );

        expect(result).toBeNull();
      });
    });

    describe('LineChartConfiguration validation', () => {
      it('should validate a valid LineChartConfiguration', async () => {
        const result = await service.validateWidgetConfiguration(
          WidgetType.GRAPH,
          TEST_LINE_CHART_CONFIG,
        );

        expect(result).toBeDefined();
        expect(result).toMatchObject(TEST_LINE_CHART_CONFIG);
      });

      it('should validate a minimal LineChartConfiguration', async () => {
        const minimalConfig = {
          graphType: GraphType.LINE,
          aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
          aggregateOperation: AggregateOperations.AVG,
          groupByFieldMetadataIdX: TEST_FIELD_METADATA_ID_2,
          orderByX: GraphOrderBy.VALUE_DESC,
        };

        const result = await service.validateWidgetConfiguration(
          WidgetType.GRAPH,
          minimalConfig,
        );

        expect(result).toBeDefined();
        expect(result).toMatchObject(minimalConfig);
      });
    });

    describe('PieChartConfiguration validation', () => {
      it('should validate a valid PieChartConfiguration', async () => {
        const result = await service.validateWidgetConfiguration(
          WidgetType.GRAPH,
          TEST_PIE_CHART_CONFIG,
        );

        expect(result).toBeDefined();
        expect(result).toMatchObject(TEST_PIE_CHART_CONFIG);
      });

      it('should validate a minimal PieChartConfiguration', async () => {
        const minimalConfig = {
          graphType: GraphType.PIE,
          groupByFieldMetadataId: TEST_FIELD_METADATA_ID_1,
          aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_2,
          aggregateOperation: AggregateOperations.COUNT,
          orderBy: GraphOrderBy.FIELD_DESC,
        };

        const result = await service.validateWidgetConfiguration(
          WidgetType.GRAPH,
          minimalConfig,
        );

        expect(result).toBeDefined();
        expect(result).toMatchObject(minimalConfig);
      });
    });

    describe('GaugeChartConfiguration validation', () => {
      it('should validate a valid GaugeChartConfiguration', async () => {
        const result = await service.validateWidgetConfiguration(
          WidgetType.GRAPH,
          TEST_GAUGE_CHART_CONFIG,
        );

        expect(result).toBeDefined();
        expect(result).toMatchObject(TEST_GAUGE_CHART_CONFIG);
      });

      it('should validate a minimal GaugeChartConfiguration', async () => {
        const minimalConfig = {
          graphType: GraphType.GAUGE,
          aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
          aggregateOperation: AggregateOperations.SUM,
          aggregateOperationTotal: AggregateOperations.COUNT,
          aggregateFieldMetadataIdTotal: TEST_FIELD_METADATA_ID_2,
        };

        const result = await service.validateWidgetConfiguration(
          WidgetType.GRAPH,
          minimalConfig,
        );

        expect(result).toBeDefined();
        expect(result).toMatchObject(minimalConfig);
      });

      it('should return null for GaugeChartConfiguration missing total fields', async () => {
        const invalidConfig = {
          graphType: GraphType.GAUGE,
          aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
          aggregateOperation: AggregateOperations.SUM,
          // Missing aggregateOperationTotal and aggregateFieldMetadataIdTotal
        };

        const result = await service.validateWidgetConfiguration(
          WidgetType.GRAPH,
          invalidConfig,
        );

        expect(result).toBeNull();
      });
    });

    describe('Generic validation', () => {
      it('should return null for null configuration', async () => {
        const result = await service.validateWidgetConfiguration(
          WidgetType.IFRAME,
          null,
        );

        expect(result).toBeNull();
      });

      it('should return null for undefined configuration', async () => {
        const result = await service.validateWidgetConfiguration(
          WidgetType.IFRAME,
          undefined,
        );

        expect(result).toBeNull();
      });

      it('should return null for non-object configuration', async () => {
        const result = await service.validateWidgetConfiguration(
          WidgetType.IFRAME,
          'invalid' as any,
        );

        expect(result).toBeNull();
      });

      it('should return null for unsupported widget type', async () => {
        const result = await service.validateWidgetConfiguration(
          WidgetType.VIEW,
          TEST_IFRAME_CONFIG,
        );

        expect(result).toBeNull();
      });

      it('should return null for FIELDS widget type', async () => {
        const result = await service.validateWidgetConfiguration(
          WidgetType.FIELDS,
          TEST_NUMBER_CHART_CONFIG,
        );

        expect(result).toBeNull();
      });

      it('should return null for GRAPH widget without graphType', async () => {
        const configWithoutGraphType = {
          aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
          aggregateOperation: AggregateOperations.COUNT,
        };

        const result = await service.validateWidgetConfiguration(
          WidgetType.GRAPH,
          configWithoutGraphType,
        );

        expect(result).toBeNull();
      });

      it('should return null for GRAPH widget with invalid graphType', async () => {
        const configWithInvalidGraphType = {
          graphType: 'INVALID_TYPE',
          aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
          aggregateOperation: AggregateOperations.COUNT,
        };

        const result = await service.validateWidgetConfiguration(
          WidgetType.GRAPH,
          configWithInvalidGraphType,
        );

        expect(result).toBeNull();
      });
    });

    describe('Type mismatch validation', () => {
      it('should return null when IFRAME widget has graph configuration', async () => {
        const result = await service.validateWidgetConfiguration(
          WidgetType.IFRAME,
          TEST_NUMBER_CHART_CONFIG,
        );

        expect(result).toBeNull();
      });

      it('should return null when GRAPH widget has iframe configuration', async () => {
        const result = await service.validateWidgetConfiguration(
          WidgetType.GRAPH,
          TEST_IFRAME_CONFIG,
        );

        expect(result).toBeNull();
      });
    });

    describe('Optional field validation', () => {
      it('should validate NumberChart with all optional fields', async () => {
        const configWithOptionals = {
          graphType: GraphType.NUMBER,
          aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
          aggregateOperation: AggregateOperations.COUNT,
          label: 'Test Label',
          format: '0,0.00',
          description: 'Test description',
          color: '#FF5733',
          filter: { field: 'status', operator: 'eq', value: 'active' },
        };

        const result = await service.validateWidgetConfiguration(
          WidgetType.GRAPH,
          configWithOptionals,
        );

        expect(result).toBeDefined();
        expect(result).toMatchObject(configWithOptionals);
      });

      it('should validate BarChart with range constraints', async () => {
        const configWithRange = {
          graphType: GraphType.BAR,
          aggregateFieldMetadataId: TEST_FIELD_METADATA_ID_1,
          aggregateOperation: AggregateOperations.SUM,
          groupByFieldMetadataIdX: TEST_FIELD_METADATA_ID_2,
          orderByX: GraphOrderBy.FIELD_ASC,
          rangeMin: 0,
          rangeMax: 1000,
        };

        const result = await service.validateWidgetConfiguration(
          WidgetType.GRAPH,
          configWithRange,
        );

        expect(result).toBeDefined();
        expect(result).toMatchObject(configWithRange);
      });
    });
  });
});