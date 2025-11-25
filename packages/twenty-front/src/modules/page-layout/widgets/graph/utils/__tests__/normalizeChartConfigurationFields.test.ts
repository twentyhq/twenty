import { GraphOrderBy, GraphType } from '~/generated-metadata/graphql';
import { normalizeChartConfigurationFields } from '../normalizeChartConfigurationFields';

describe('normalizeChartConfigurationFields', () => {
  it('should normalize Bar chart configuration fields', () => {
    const barConfig = {
      __typename: 'BarChartConfiguration' as const,
      graphType: GraphType.VERTICAL_BAR,
      primaryAxisGroupByFieldMetadataId: 'field-id-123',
      primaryAxisGroupBySubFieldName: 'subFieldName',
      primaryAxisDateGranularity: 'Month' as any,
      primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
      aggregateFieldMetadataId: 'aggregate-id-456',
      aggregateOperation: 'sum' as any,
    };

    const result = normalizeChartConfigurationFields(barConfig);

    expect(result).toEqual({
      groupByFieldMetadataId: 'field-id-123',
      groupBySubFieldName: 'subFieldName',
      dateGranularity: 'Month',
      orderBy: GraphOrderBy.FIELD_ASC,
    });
  });

  it('should normalize Line chart configuration fields', () => {
    const lineConfig = {
      __typename: 'LineChartConfiguration' as const,
      graphType: GraphType.LINE,
      primaryAxisGroupByFieldMetadataId: 'line-field-id',
      primaryAxisGroupBySubFieldName: 'lineSubField',
      primaryAxisDateGranularity: 'Week' as any,
      primaryAxisOrderBy: GraphOrderBy.VALUE_DESC,
      aggregateFieldMetadataId: 'line-aggregate-id',
      aggregateOperation: 'count' as any,
    };

    const result = normalizeChartConfigurationFields(lineConfig);

    expect(result).toEqual({
      groupByFieldMetadataId: 'line-field-id',
      groupBySubFieldName: 'lineSubField',
      dateGranularity: 'Week',
      orderBy: GraphOrderBy.VALUE_DESC,
    });
  });

  it('should normalize Pie chart configuration fields', () => {
    const pieConfig = {
      __typename: 'PieChartConfiguration' as const,
      graphType: GraphType.PIE,
      groupByFieldMetadataId: 'pie-field-id',
      groupBySubFieldName: 'pieSubField',
      dateGranularity: 'Day' as any,
      orderBy: GraphOrderBy.FIELD_DESC,
      aggregateFieldMetadataId: 'pie-aggregate-id',
      aggregateOperation: 'avg' as any,
    };

    const result = normalizeChartConfigurationFields(pieConfig);

    expect(result).toEqual({
      groupByFieldMetadataId: 'pie-field-id',
      groupBySubFieldName: 'pieSubField',
      dateGranularity: 'Day',
      orderBy: GraphOrderBy.FIELD_DESC,
    });
  });

  it('should handle Bar chart configuration with undefined optional fields', () => {
    const barConfig = {
      __typename: 'BarChartConfiguration' as const,
      graphType: GraphType.VERTICAL_BAR,
      primaryAxisGroupByFieldMetadataId: 'field-id-123',
      aggregateFieldMetadataId: 'aggregate-id-456',
      aggregateOperation: 'sum' as any,
    };

    const result = normalizeChartConfigurationFields(barConfig);

    expect(result).toEqual({
      groupByFieldMetadataId: 'field-id-123',
      groupBySubFieldName: undefined,
      dateGranularity: undefined,
      orderBy: undefined,
    });
  });

  it('should handle Pie chart configuration with undefined optional fields', () => {
    const pieConfig = {
      __typename: 'PieChartConfiguration' as const,
      graphType: GraphType.PIE,
      groupByFieldMetadataId: 'pie-field-id',
      aggregateFieldMetadataId: 'pie-aggregate-id',
      aggregateOperation: 'count' as any,
    };

    const result = normalizeChartConfigurationFields(pieConfig);

    expect(result).toEqual({
      groupByFieldMetadataId: 'pie-field-id',
      groupBySubFieldName: undefined,
      dateGranularity: undefined,
      orderBy: undefined,
    });
  });

  it('should return empty object for unknown configuration type', () => {
    const unknownConfig = {
      someField: 'value',
    } as any;

    const result = normalizeChartConfigurationFields(unknownConfig);

    expect(result).toEqual({});
  });
});
