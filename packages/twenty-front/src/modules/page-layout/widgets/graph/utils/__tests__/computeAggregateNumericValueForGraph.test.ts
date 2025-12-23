import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { computeAggregateNumericValueForGraph } from '@/page-layout/widgets/graph/utils/computeAggregateNumericValueForGraph';

describe('computeAggregateNumericValueForGraph', () => {
  it('should throw error for empty data', () => {
    expect(() =>
      computeAggregateNumericValueForGraph({
        data: {},
        objectMetadataItem: { fields: [] } as any,
      }),
    ).toThrow('Empty aggregate records data');
  });

  it('should return count value for COUNT operation', () => {
    const result = computeAggregateNumericValueForGraph({
      data: { status: { COUNT: 25 } },
      objectMetadataItem: {
        fields: [{ id: 'field-1', name: 'status' }],
      } as any,
      fieldMetadataId: 'field-1',
      aggregateOperation: AggregateOperations.COUNT,
    });

    expect(result).toBe(25);
  });

  it('should multiply by 100 for percentage operations', () => {
    const result = computeAggregateNumericValueForGraph({
      data: { status: { PERCENTAGE_EMPTY: 0.25 } },
      objectMetadataItem: {
        fields: [{ id: 'field-1', name: 'status' }],
      } as any,
      fieldMetadataId: 'field-1',
      aggregateOperation: AggregateOperations.PERCENTAGE_EMPTY,
    });

    expect(result).toBe(25);
  });

  it('should return numeric value for NUMBER field', () => {
    const result = computeAggregateNumericValueForGraph({
      data: { amount: { SUM: 1000 } },
      objectMetadataItem: {
        fields: [
          { id: 'field-1', name: 'amount', type: FieldMetadataType.NUMBER },
        ],
      } as any,
      fieldMetadataId: 'field-1',
      aggregateOperation: AggregateOperations.SUM,
    });

    expect(result).toBe(1000);
  });

  it('should return timestamp for DATE field', () => {
    const dateString = '2024-01-15';
    const result = computeAggregateNumericValueForGraph({
      data: { createdAt: { MIN: dateString } },
      objectMetadataItem: {
        fields: [
          { id: 'field-1', name: 'createdAt', type: FieldMetadataType.DATE },
        ],
      } as any,
      fieldMetadataId: 'field-1',
      aggregateOperation: AggregateOperations.MIN,
    });

    expect(result).toBe(new Date(dateString).getTime());
  });
});
