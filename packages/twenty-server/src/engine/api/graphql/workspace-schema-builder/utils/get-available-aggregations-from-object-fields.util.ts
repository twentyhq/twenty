import { GraphQLISODateTime } from '@nestjs/graphql';

import { GraphQLFloat, GraphQLString } from 'graphql';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { capitalize } from 'src/utils/capitalize';

enum AGGREGATION_OPERATIONS {
  min = 'MIN',
  max = 'MAX',
  avg = 'AVG',
  sum = 'SUM',
}

type AggregationValue = {
  type: typeof GraphQLString;
  description: string;
  fromField: string;
  aggregationOperation: AGGREGATION_OPERATIONS;
};

export type AggregationField = {
  [key: string]: AggregationValue;
};

export const getAvailableAggregationsFromObjectFields = (
  fields: FieldMetadataInterface[],
): AggregationField[] => {
  return fields.reduce<Array<Record<string, any>>>((acc, field) => {
    if (field.type === FieldMetadataType.DATE_TIME) {
      return [
        ...acc,
        {
          [`min${capitalize(field.name)}`]: {
            type: GraphQLISODateTime,
            description: `Oldest date contained in the field ${field.name}`,
            fromField: field.name,
            aggregationOperation: AGGREGATION_OPERATIONS.min,
          },
        },
        {
          [`max${capitalize(field.name)}`]: {
            type: GraphQLISODateTime,
            description: `Most recent date contained in the field ${field.name}`,
            fromField: field.name,
            aggregationOperation: AGGREGATION_OPERATIONS.max,
          },
        },
      ];
    }

    if (field.type === FieldMetadataType.NUMBER) {
      return [
        ...acc,
        {
          [`min${capitalize(field.name)}`]: {
            type: GraphQLFloat,
            description: `Minimum value contained in the field ${field.name}`,
            fromField: field.name,
            aggregationOperation: AGGREGATION_OPERATIONS.min,
          },
        },
        {
          [`max${capitalize(field.name)}`]: {
            type: GraphQLFloat,
            description: `Maximum value contained in the field ${field.name}`,
            fromField: field.name,
            aggregationOperation: AGGREGATION_OPERATIONS.max,
          },
        },
        {
          [`avg${capitalize(field.name)}`]: {
            type: GraphQLFloat,
            description: `Average value contained in the field ${field.name}`,
            fromField: field.name,
            aggregationOperation: AGGREGATION_OPERATIONS.avg,
          },
        },
        {
          [`sum${capitalize(field.name)}`]: {
            type: GraphQLFloat,
            description: `Sum of amounts contained in the field ${field.name}`,
            fromField: field.name,
            aggregationOperation: AGGREGATION_OPERATIONS.sum,
          },
        },
      ];
    }

    return acc;
  }, []);
};
