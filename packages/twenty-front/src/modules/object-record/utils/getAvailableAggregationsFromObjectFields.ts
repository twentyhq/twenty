import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { DATE_AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/DateAggregateOperations';
import { ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import {
  capitalize,
  FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION,
  isFieldMetadataDateKind,
} from 'twenty-shared';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type NameForAggregation = {
  [T in ExtendedAggregateOperations]?: string;
};

type Aggregations = {
  [key: string]: NameForAggregation;
};

export const getAvailableAggregationsFromObjectFields = (
  fields: FieldMetadataItem[],
): Aggregations => {
  return fields.reduce<Record<string, NameForAggregation>>(
    (acc, field) => {
      if (field.isSystem === true) {
        return acc;
      }

      if (field.type === FieldMetadataType.RELATION) {
        acc[field.name] = {
          [AGGREGATE_OPERATIONS.count]: 'totalCount',
        };
        return acc;
      }

      acc[field.name] = {
        [AGGREGATE_OPERATIONS.countUniqueValues]: `countUniqueValues${capitalize(field.name)}`,
        [AGGREGATE_OPERATIONS.countEmpty]: `countEmpty${capitalize(field.name)}`,
        [AGGREGATE_OPERATIONS.countNotEmpty]: `countNotEmpty${capitalize(field.name)}`,
        [AGGREGATE_OPERATIONS.percentageEmpty]: `percentageEmpty${capitalize(field.name)}`,
        [AGGREGATE_OPERATIONS.percentageNotEmpty]: `percentageNotEmpty${capitalize(field.name)}`,
        [AGGREGATE_OPERATIONS.count]: 'totalCount',
      };

      if (field.type === FieldMetadataType.NUMBER) {
        acc[field.name] = {
          ...acc[field.name],
          [AGGREGATE_OPERATIONS.min]: `min${capitalize(field.name)}`,
          [AGGREGATE_OPERATIONS.max]: `max${capitalize(field.name)}`,
          [AGGREGATE_OPERATIONS.avg]: `avg${capitalize(field.name)}`,
          [AGGREGATE_OPERATIONS.sum]: `sum${capitalize(field.name)}`,
        };
      }

      if (field.type === FieldMetadataType.CURRENCY) {
        acc[field.name] = {
          ...acc[field.name],
          [AGGREGATE_OPERATIONS.min]: `min${capitalize(field.name)}AmountMicros`,
          [AGGREGATE_OPERATIONS.max]: `max${capitalize(field.name)}AmountMicros`,
          [AGGREGATE_OPERATIONS.avg]: `avg${capitalize(field.name)}AmountMicros`,
          [AGGREGATE_OPERATIONS.sum]: `sum${capitalize(field.name)}AmountMicros`,
        };
      }

      if (field.type === FieldMetadataType.BOOLEAN) {
        acc[field.name] = {
          ...acc[field.name],
          [AGGREGATE_OPERATIONS.countTrue]: `countTrue${capitalize(field.name)}`,
          [AGGREGATE_OPERATIONS.countFalse]: `countFalse${capitalize(field.name)}`,
        };
      }

      if (isFieldMetadataDateKind(field.type) === true) {
        acc[field.name] = {
          ...acc[field.name],
          [DATE_AGGREGATE_OPERATIONS.earliest]: `min${capitalize(field.name)}`,
          [DATE_AGGREGATE_OPERATIONS.latest]: `max${capitalize(field.name)}`,
        };
      }

      if (acc[field.name] === undefined) {
        acc[field.name] = {};
      }

      return acc;
    },
    {
      [FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION]: {
        [AGGREGATE_OPERATIONS.count]: 'totalCount',
      },
    },
  );
};
