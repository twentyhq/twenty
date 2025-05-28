import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { DATE_AggregateOperations } from '@/object-record/record-table/constants/DateAggregateOperations';
import { ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
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
          [AggregateOperations.count]: 'totalCount',
        };
        return acc;
      }

      acc[field.name] = {
        [AggregateOperations.countUniqueValues]: `countUniqueValues${capitalize(field.name)}`,
        [AggregateOperations.countEmpty]: `countEmpty${capitalize(field.name)}`,
        [AggregateOperations.countNotEmpty]: `countNotEmpty${capitalize(field.name)}`,
        [AggregateOperations.percentageEmpty]: `percentageEmpty${capitalize(field.name)}`,
        [AggregateOperations.percentageNotEmpty]: `percentageNotEmpty${capitalize(field.name)}`,
        [AggregateOperations.count]: 'totalCount',
      };

      if (field.type === FieldMetadataType.NUMBER) {
        acc[field.name] = {
          ...acc[field.name],
          [AggregateOperations.min]: `min${capitalize(field.name)}`,
          [AggregateOperations.max]: `max${capitalize(field.name)}`,
          [AggregateOperations.avg]: `avg${capitalize(field.name)}`,
          [AggregateOperations.sum]: `sum${capitalize(field.name)}`,
        };
      }

      if (field.type === FieldMetadataType.CURRENCY) {
        acc[field.name] = {
          ...acc[field.name],
          [AggregateOperations.min]: `min${capitalize(field.name)}AmountMicros`,
          [AggregateOperations.max]: `max${capitalize(field.name)}AmountMicros`,
          [AggregateOperations.avg]: `avg${capitalize(field.name)}AmountMicros`,
          [AggregateOperations.sum]: `sum${capitalize(field.name)}AmountMicros`,
        };
      }

      if (field.type === FieldMetadataType.BOOLEAN) {
        acc[field.name] = {
          ...acc[field.name],
          [AggregateOperations.countTrue]: `countTrue${capitalize(field.name)}`,
          [AggregateOperations.countFalse]: `countFalse${capitalize(field.name)}`,
        };
      }

      if (isFieldMetadataDateKind(field.type) === true) {
        acc[field.name] = {
          ...acc[field.name],
          [DATE_AggregateOperations.earliest]: `min${capitalize(field.name)}`,
          [DATE_AggregateOperations.latest]: `max${capitalize(field.name)}`,
        };
      }

      if (acc[field.name] === undefined) {
        acc[field.name] = {};
      }

      return acc;
    },
    {
      [FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION]: {
        [AggregateOperations.count]: 'totalCount',
      },
    },
  );
};
