import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { type AggregateOperationsOmittingStandardOperations } from '@/object-record/types/AggregateOperationsOmittingStandardOperations';
import { isFieldTypeValidForAggregateOperation } from '@/object-record/utils/isFieldTypeValidForAggregateOperation';
import { FieldMetadataType } from '~/generated-metadata/graphql';

describe('isFieldTypeValidForAggregateOperation', () => {
  it('should return true for valid field types and operations', () => {
    expect(
      isFieldTypeValidForAggregateOperation(
        FieldMetadataType.NUMBER,
        AggregateOperations.SUM,
      ),
    ).toBe(true);

    expect(
      isFieldTypeValidForAggregateOperation(
        FieldMetadataType.CURRENCY,
        AggregateOperations.MIN,
      ),
    ).toBe(true);
  });

  it('should return false for invalid field types', () => {
    expect(
      isFieldTypeValidForAggregateOperation(
        FieldMetadataType.TEXT,
        AggregateOperations.AVG,
      ),
    ).toBe(false);

    expect(
      isFieldTypeValidForAggregateOperation(
        FieldMetadataType.BOOLEAN,
        AggregateOperations.MAX,
      ),
    ).toBe(false);
  });

  it('should handle all aggregate operations', () => {
    const numericField = FieldMetadataType.NUMBER;
    const operations = [
      AggregateOperations.MIN,
      AggregateOperations.MAX,
      AggregateOperations.AVG,
      AggregateOperations.SUM,
    ];

    operations.forEach((operation) => {
      expect(
        isFieldTypeValidForAggregateOperation(
          numericField,
          operation as AggregateOperationsOmittingStandardOperations,
        ),
      ).toBe(true);
    });
  });
});
