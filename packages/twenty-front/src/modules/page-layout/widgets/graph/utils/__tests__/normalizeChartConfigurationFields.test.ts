import {
  AggregateOperations,
  GraphOrderBy,
  ObjectRecordGroupByDateGranularity,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';
import { normalizeChartConfigurationFields } from '@/page-layout/widgets/graph/utils/normalizeChartConfigurationFields';

describe('normalizeChartConfigurationFields', () => {
  describe('Bar and Line charts (with primaryAxis prefix)', () => {
    it('should extract fields from Bar chart configuration', () => {
      const barConfig = {
        __typename: 'BarChartConfiguration',
        primaryAxisGroupByFieldMetadataId: 'field-123',
        primaryAxisGroupBySubFieldName: 'subField',
        primaryAxisDateGranularity: ObjectRecordGroupByDateGranularity.MONTH,
        primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        aggregateFieldMetadataId: 'aggregate-456',
        aggregateOperation: AggregateOperations.SUM,
        configurationType: WidgetConfigurationType.BAR_CHART,
      } as any;

      const result = normalizeChartConfigurationFields(barConfig);

      expect(result.groupByFieldMetadataId).toBe('field-123');
      expect(result.groupBySubFieldName).toBe('subField');
      expect(result.dateGranularity).toBe(
        ObjectRecordGroupByDateGranularity.MONTH,
      );
      expect(result.orderBy).toBe(GraphOrderBy.FIELD_ASC);
    });

    it('should extract fields from Line chart configuration', () => {
      const lineConfig = {
        __typename: 'LineChartConfiguration',
        primaryAxisGroupByFieldMetadataId: 'field-789',
        primaryAxisOrderBy: GraphOrderBy.VALUE_DESC,
        aggregateFieldMetadataId: 'aggregate-012',
        aggregateOperation: AggregateOperations.COUNT,
        configurationType: WidgetConfigurationType.LINE_CHART,
      } as any;

      const result = normalizeChartConfigurationFields(lineConfig);

      expect(result.groupByFieldMetadataId).toBe('field-789');
      expect(result.orderBy).toBe(GraphOrderBy.VALUE_DESC);
      expect(result.groupBySubFieldName).toBeUndefined();
      expect(result.dateGranularity).toBeUndefined();
    });
  });

  describe('Pie charts (without prefix)', () => {
    it('should extract fields from Pie chart configuration', () => {
      const pieConfig = {
        __typename: 'PieChartConfiguration',
        groupByFieldMetadataId: 'pie-field',
        groupBySubFieldName: 'pieSubField',
        dateGranularity: ObjectRecordGroupByDateGranularity.DAY,
        orderBy: GraphOrderBy.FIELD_DESC,
        aggregateFieldMetadataId: 'pie-aggregate',
        aggregateOperation: AggregateOperations.AVG,
        configurationType: WidgetConfigurationType.PIE_CHART,
      } as any;

      const result = normalizeChartConfigurationFields(pieConfig);

      expect(result.groupByFieldMetadataId).toBe('pie-field');
      expect(result.groupBySubFieldName).toBe('pieSubField');
      expect(result.dateGranularity).toBe(
        ObjectRecordGroupByDateGranularity.DAY,
      );
      expect(result.orderBy).toBe(GraphOrderBy.FIELD_DESC);
    });

    it('should handle minimal Pie chart configuration', () => {
      const pieConfig = {
        __typename: 'PieChartConfiguration',
        groupByFieldMetadataId: 'minimal-field',
        aggregateFieldMetadataId: 'minimal-aggregate',
        aggregateOperation: AggregateOperations.COUNT,
        configurationType: WidgetConfigurationType.PIE_CHART,
      } as any;

      const result = normalizeChartConfigurationFields(pieConfig);

      expect(result.groupByFieldMetadataId).toBe('minimal-field');
      expect(result.groupBySubFieldName).toBeUndefined();
      expect(result.dateGranularity).toBeUndefined();
      expect(result.orderBy).toBeUndefined();
    });
  });

  describe('Edge cases', () => {
    it('should return empty object for configuration without recognized fields', () => {
      const unknownConfig = {
        someOtherField: 'value',
        aggregateFieldMetadataId: 'ignored',
      } as any;

      const result = normalizeChartConfigurationFields(unknownConfig);

      expect(result).toEqual({});
    });

    it('should use __typename to determine fields even when both patterns exist', () => {
      const mixedConfig = {
        __typename: 'BarChartConfiguration',
        primaryAxisGroupByFieldMetadataId: 'primary-field',
        groupByFieldMetadataId: 'fallback-field',
        primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        orderBy: GraphOrderBy.FIELD_DESC,
      } as any;

      const result = normalizeChartConfigurationFields(mixedConfig);

      expect(result.groupByFieldMetadataId).toBe('primary-field');
      expect(result.orderBy).toBe(GraphOrderBy.FIELD_ASC);
    });

    it('should extract Pie fields when __typename is PieChartConfiguration even if primaryAxis fields exist', () => {
      const mixedConfig = {
        __typename: 'PieChartConfiguration',
        primaryAxisGroupByFieldMetadataId: 'primary-field',
        groupByFieldMetadataId: 'pie-field',
        primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        orderBy: GraphOrderBy.FIELD_DESC,
      } as any;

      const result = normalizeChartConfigurationFields(mixedConfig);

      expect(result.groupByFieldMetadataId).toBe('pie-field');
      expect(result.orderBy).toBe(GraphOrderBy.FIELD_DESC);
    });
  });
});
