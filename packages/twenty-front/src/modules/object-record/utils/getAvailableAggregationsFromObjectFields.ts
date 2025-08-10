import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { DateAggregateOperations } from '@/object-record/record-table/constants/DateAggregateOperations';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION } from 'twenty-shared/constants';
import { capitalize, isFieldMetadataDateKind } from 'twenty-shared/utils';
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
          [AggregateOperations.COUNT]: 'totalCount',
        };
        return acc;
      }

      acc[field.name] = {
        [AggregateOperations.COUNT_UNIQUE_VALUES]: `countUniqueValues${capitalize(field.name)}`,
        [AggregateOperations.COUNT_EMPTY]: `countEmpty${capitalize(field.name)}`,
        [AggregateOperations.COUNT_NOT_EMPTY]: `countNotEmpty${capitalize(field.name)}`,
        [AggregateOperations.PERCENTAGE_EMPTY]: `percentageEmpty${capitalize(field.name)}`,
        [AggregateOperations.PERCENTAGE_NOT_EMPTY]: `percentageNotEmpty${capitalize(field.name)}`,
        [AggregateOperations.COUNT]: 'totalCount',
      };

      if (field.type === FieldMetadataType.NUMBER) {
        acc[field.name] = {
          ...acc[field.name],
          [AggregateOperations.MIN]: `min${capitalize(field.name)}`,
          [AggregateOperations.MAX]: `max${capitalize(field.name)}`,
          [AggregateOperations.AVG]: `avg${capitalize(field.name)}`,
          [AggregateOperations.SUM]: `sum${capitalize(field.name)}`,
        };
      }

      if (field.type === FieldMetadataType.CURRENCY) {
        acc[field.name] = {
          ...acc[field.name],
          [AggregateOperations.MIN]: `min${capitalize(field.name)}AmountMicros`,
          [AggregateOperations.MAX]: `max${capitalize(field.name)}AmountMicros`,
          [AggregateOperations.AVG]: `avg${capitalize(field.name)}AmountMicros`,
          [AggregateOperations.SUM]: `sum${capitalize(field.name)}AmountMicros`,
        };
      }

      if (field.type === FieldMetadataType.BOOLEAN) {
        acc[field.name] = {
          ...acc[field.name],
          [AggregateOperations.COUNT_TRUE]: `countTrue${capitalize(field.name)}`,
          [AggregateOperations.COUNT_FALSE]: `countFalse${capitalize(field.name)}`,
        };
      }

      if (isFieldMetadataDateKind(field.type) === true) {
        acc[field.name] = {
          ...acc[field.name],
          [DateAggregateOperations.EARLIEST]: `min${capitalize(field.name)}`,
          [DateAggregateOperations.LATEST]: `max${capitalize(field.name)}`,
        };
      }

      if (acc[field.name] === undefined) {
        acc[field.name] = {};
      }

      return acc;
    },
    {
      [FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION]: {
        [AggregateOperations.COUNT]: 'totalCount',
      },
    },
  );
};
