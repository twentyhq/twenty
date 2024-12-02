import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type AGGREGATE_OPERATIONS_WITHOUT_COUNT = Exclude<
  AGGREGATE_OPERATIONS,
  AGGREGATE_OPERATIONS.count
>;
type AvailableFieldsForAggregation = {
  [T in AGGREGATE_OPERATIONS_WITHOUT_COUNT]?: string[];
};

const FIELDS_AVAILABLE_BY_AGGREGATE_OPERATION = {
  [AGGREGATE_OPERATIONS.min]: [
    FieldMetadataType.Number,
    FieldMetadataType.Currency,
  ],
  [AGGREGATE_OPERATIONS.max]: [
    FieldMetadataType.Number,
    FieldMetadataType.Currency,
  ],
  [AGGREGATE_OPERATIONS.avg]: [
    FieldMetadataType.Number,
    FieldMetadataType.Currency,
  ],
  [AGGREGATE_OPERATIONS.sum]: [
    FieldMetadataType.Number,
    FieldMetadataType.Currency,
  ],
};

const initializeAggregationMap = (): AvailableFieldsForAggregation => {
  return Object.keys(FIELDS_AVAILABLE_BY_AGGREGATE_OPERATION).reduce(
    (acc, operation) => ({
      ...acc,
      [operation]: [],
    }),
    {},
  );
};

const isFieldTypeValidForOperation = (
  fieldType: FieldMetadataType,
  operation: AGGREGATE_OPERATIONS_WITHOUT_COUNT,
): boolean => {
  return FIELDS_AVAILABLE_BY_AGGREGATE_OPERATION[operation].includes(fieldType);
};

export const getAvailableFieldsForAggregationFromObjectFieldss = (
  fields: FieldMetadataItem[],
): AvailableFieldsForAggregation => {
  const aggregationMap = initializeAggregationMap();

  return fields.reduce((acc, field) => {
    Object.keys(FIELDS_AVAILABLE_BY_AGGREGATE_OPERATION).forEach(
      (operation) => {
        const typedOperation = operation as AGGREGATE_OPERATIONS_WITHOUT_COUNT;

        if (isFieldTypeValidForOperation(field.type, typedOperation)) {
          acc[typedOperation]?.push(field.id);
        }
      },
    );

    return acc;
  }, aggregationMap);
};
