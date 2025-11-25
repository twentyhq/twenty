import {
  AggregateOperations,
  GraphOrderBy,
  GraphType,
  ObjectRecordGroupByDateGranularity,
} from '~/generated-metadata/graphql';
import { normalizeChartConfigurationFields } from '../normalizeChartConfigurationFields';

describe('normalizeChartConfigurationFields', () => {
  describe('Bar and Line charts (with primaryAxis prefix)', () => {
    it('should extract fields from Bar chart configuration', () => {
      const barConfig = {
        primaryAxisGroupByFieldMetadataId: 'field-123',
        primaryAxisGroupBySubFieldName: 'subField',
        primaryAxisDateGranularity: ObjectRecordGroupByDateGranularity.Month,
        primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        aggregateFieldMetadataId: 'aggregate-456',
        aggregateOperation: AggregateOperations.Sum,
        graphType: GraphType.VERTICAL_BAR,
      } as any;

      const result = normalizeChartConfigurationFields(barConfig);

      expect(result.groupByFieldMetadataId).toBe('field-123');
      expect(result.groupBySubFieldName).toBe('subField');
      expect(result.dateGranularity).toBe(ObjectRecordGroupByDateGranularity.Month);
      expect(result.orderBy).toBe(GraphOrderBy.FIELD_ASC);
    });

    it('should extract fields from Line chart configuration', () => {
      const lineConfig = {
        primaryAxisGroupByFieldMetadataId: 'field-789',
        primaryAxisOrderBy: GraphOrderBy.VALUE_DESC,
        aggregateFieldMetadataId: 'aggregate-012',
        aggregateOperation: AggregateOperations.Count,
        graphType: GraphType.LINE,
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
        groupByFieldMetadataId: 'pie-field',
        groupBySubFieldName: 'pieSubField',
        dateGranularity: ObjectRecordGroupByDateGranularity.Day,
        orderBy: GraphOrderBy.FIELD_DESC,
        aggregateFieldMetadataId: 'pie-aggregate',
        aggregateOperation: AggregateOperations.Avg,
        graphType: GraphType.PIE,
      } as any;

      const result = normalizeChartConfigurationFields(pieConfig);

      expect(result.groupByFieldMetadataId).toBe('pie-field');
      expect(result.groupBySubFieldName).toBe('pieSubField');
      expect(result.dateGranularity).toBe(ObjectRecordGroupByDateGranularity.Day);
      expect(result.orderBy).toBe(GraphOrderBy.FIELD_DESC);
    });

    it('should handle minimal Pie chart configuration', () => {
      const pieConfig = {
        groupByFieldMetadataId: 'minimal-field',
        aggregateFieldMetadataId: 'minimal-aggregate',
        aggregateOperation: AggregateOperations.Count,
        graphType: GraphType.PIE,
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

    it('should handle configuration with both field patterns (prefer primaryAxis)', () => {
      const mixedConfig = {
        primaryAxisGroupByFieldMetadataId: 'primary-field',
        groupByFieldMetadataId: 'fallback-field',
        primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
        orderBy: GraphOrderBy.FIELD_DESC,
      } as any;

      const result = normalizeChartConfigurationFields(mixedConfig);

      expect(result.groupByFieldMetadataId).toBe('primary-field');
      expect(result.orderBy).toBe(GraphOrderBy.FIELD_ASC);
    });
  });
});
