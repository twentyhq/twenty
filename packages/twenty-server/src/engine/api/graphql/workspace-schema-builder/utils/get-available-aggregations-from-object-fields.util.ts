import { GraphQLISODateTime } from '@nestjs/graphql';

import { GraphQLFloat, GraphQLInt, GraphQLScalarType } from 'graphql';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { AGGREGATE_OPERATIONS } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { capitalize } from 'src/utils/capitalize';

export type AggregationField = {
  type: GraphQLScalarType;
  description: string;
  fromField: string;
  fromSubField?: string;
  aggregateOperation: AGGREGATE_OPERATIONS;
};

export const getAvailableAggregationsFromObjectFields = (
  fields: FieldMetadataInterface[],
): Record<string, AggregationField> => {
  return fields.reduce<Record<string, AggregationField>>((acc, field) => {
    acc['totalCount'] = {
      type: GraphQLInt,
      description: `Total number of records in the connection`,
      fromField: 'id',
      aggregateOperation: AGGREGATE_OPERATIONS.count,
    };

    if (field.type === FieldMetadataType.DATE_TIME) {
      acc[`min${capitalize(field.name)}`] = {
        type: GraphQLISODateTime,
        description: `Oldest date contained in the field ${field.name}`,
        fromField: field.name,
        aggregateOperation: AGGREGATE_OPERATIONS.min,
      };

      acc[`max${capitalize(field.name)}`] = {
        type: GraphQLISODateTime,
        description: `Most recent date contained in the field ${field.name}`,
        fromField: field.name,
        aggregateOperation: AGGREGATE_OPERATIONS.max,
      };
    }

    if (field.type === FieldMetadataType.NUMBER) {
      acc[`min${capitalize(field.name)}`] = {
        type: GraphQLFloat,
        description: `Minimum amount contained in the field ${field.name}`,
        fromField: field.name,
        aggregateOperation: AGGREGATE_OPERATIONS.min,
      };

      acc[`max${capitalize(field.name)}`] = {
        type: GraphQLFloat,
        description: `Maximum amount contained in the field ${field.name}`,
        fromField: field.name,
        aggregateOperation: AGGREGATE_OPERATIONS.max,
      };

      acc[`avg${capitalize(field.name)}`] = {
        type: GraphQLFloat,
        description: `Average amount contained in the field ${field.name}`,
        fromField: field.name,
        aggregateOperation: AGGREGATE_OPERATIONS.avg,
      };

      acc[`sum${capitalize(field.name)}`] = {
        type: GraphQLFloat,
        description: `Sum of amounts contained in the field ${field.name}`,
        fromField: field.name,
        aggregateOperation: AGGREGATE_OPERATIONS.sum,
      };
    }

    if (field.type === FieldMetadataType.CURRENCY) {
      acc[`min${capitalize(field.name)}AmountMicros`] = {
        type: GraphQLFloat,
        description: `Minimum amount contained in the field ${field.name}`,
        fromField: field.name,
        fromSubField: 'amountMicros',
        aggregateOperation: AGGREGATE_OPERATIONS.min,
      };

      acc[`max${capitalize(field.name)}AmountMicros`] = {
        type: GraphQLFloat,
        description: `Maximal amount contained in the field ${field.name}`,
        fromField: field.name,
        fromSubField: 'amountMicros',
        aggregateOperation: AGGREGATE_OPERATIONS.max,
      };

      acc[`sum${capitalize(field.name)}AmountMicros`] = {
        type: GraphQLFloat,
        description: `Sum of amounts contained in the field ${field.name}`,
        fromField: field.name,
        fromSubField: 'amountMicros',
        aggregateOperation: AGGREGATE_OPERATIONS.sum,
      };

      acc[`avg${capitalize(field.name)}AmountMicros`] = {
        type: GraphQLFloat,
        description: `Average amount contained in the field ${field.name}`,
        fromField: field.name,
        fromSubField: 'amountMicros',
        aggregateOperation: AGGREGATE_OPERATIONS.avg,
      };
    }

    return acc;
  }, {});
};
