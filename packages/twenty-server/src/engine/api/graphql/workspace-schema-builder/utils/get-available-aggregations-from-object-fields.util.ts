import { GraphQLISODateTime } from '@nestjs/graphql';

import { GraphQLFloat, GraphQLInt, GraphQLScalarType } from 'graphql';
import {
  capitalize,
  FieldMetadataType,
  isFieldMetadataDateKind,
} from 'twenty-shared';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { AGGREGATE_OPERATIONS } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { getSubfieldsForAggregateOperation } from 'src/engine/twenty-orm/utils/get-subfields-for-aggregate-operation.util';

export type AggregationField = {
  type: GraphQLScalarType;
  description: string;
  fromField: string;
  fromFieldType: FieldMetadataType;
  fromSubFields?: string[];
  subFieldForNumericOperation?: string;
  aggregateOperation: AGGREGATE_OPERATIONS;
};

export const getAvailableAggregationsFromObjectFields = (
  fields: FieldMetadataInterface[],
): Record<string, AggregationField> => {
  return fields.reduce<Record<string, AggregationField>>(
    (acc, field) => {
      if (field.type === FieldMetadataType.RELATION) {
        return acc;
      }

      const fromSubFields = getSubfieldsForAggregateOperation(field.type);

      acc[`countUniqueValues${capitalize(field.name)}`] = {
        type: GraphQLInt,
        description: `Number of unique values for ${field.name}`,
        fromField: field.name,
        fromFieldType: field.type,
        fromSubFields,
        aggregateOperation: AGGREGATE_OPERATIONS.countUniqueValues,
      };

      acc[`countEmpty${capitalize(field.name)}`] = {
        type: GraphQLInt,
        description: `Number of empty values for ${field.name}`,
        fromField: field.name,
        fromFieldType: field.type,
        fromSubFields,
        aggregateOperation: AGGREGATE_OPERATIONS.countEmpty,
      };

      acc[`countNotEmpty${capitalize(field.name)}`] = {
        type: GraphQLInt,
        description: `Number of non-empty values for ${field.name}`,
        fromField: field.name,
        fromFieldType: field.type,
        fromSubFields,
        aggregateOperation: AGGREGATE_OPERATIONS.countNotEmpty,
      };

      acc[`percentageEmpty${capitalize(field.name)}`] = {
        type: GraphQLFloat,
        description: `Percentage of empty values for ${field.name}`,
        fromField: field.name,
        fromFieldType: field.type,
        fromSubFields,
        aggregateOperation: AGGREGATE_OPERATIONS.percentageEmpty,
      };

      acc[`percentageNotEmpty${capitalize(field.name)}`] = {
        type: GraphQLFloat,
        description: `Percentage of non-empty values for ${field.name}`,
        fromField: field.name,
        fromFieldType: field.type,
        fromSubFields,
        aggregateOperation: AGGREGATE_OPERATIONS.percentageNotEmpty,
      };

      if (isFieldMetadataDateKind(field.type)) {
        acc[`min${capitalize(field.name)}`] = {
          type: GraphQLISODateTime,
          description: `Earliest date contained in the field ${field.name}`,
          fromField: field.name,
          fromFieldType: field.type,
          aggregateOperation: AGGREGATE_OPERATIONS.min,
        };

        acc[`max${capitalize(field.name)}`] = {
          type: GraphQLISODateTime,
          description: `Latest date contained in the field ${field.name}`,
          fromField: field.name,
          fromFieldType: field.type,
          aggregateOperation: AGGREGATE_OPERATIONS.max,
        };
      }

      switch (field.type) {
        case FieldMetadataType.NUMBER:
          acc[`min${capitalize(field.name)}`] = {
            type: GraphQLFloat,
            description: `Minimum amount contained in the field ${field.name}`,
            fromField: field.name,
            fromFieldType: field.type,
            aggregateOperation: AGGREGATE_OPERATIONS.min,
          };

          acc[`max${capitalize(field.name)}`] = {
            type: GraphQLFloat,
            description: `Maximum amount contained in the field ${field.name}`,
            fromField: field.name,
            fromFieldType: field.type,
            aggregateOperation: AGGREGATE_OPERATIONS.max,
          };

          acc[`avg${capitalize(field.name)}`] = {
            type: GraphQLFloat,
            description: `Average amount contained in the field ${field.name}`,
            fromField: field.name,
            fromFieldType: field.type,
            aggregateOperation: AGGREGATE_OPERATIONS.avg,
          };

          acc[`sum${capitalize(field.name)}`] = {
            type: GraphQLFloat,
            description: `Sum of amounts contained in the field ${field.name}`,
            fromField: field.name,
            fromFieldType: field.type,
            aggregateOperation: AGGREGATE_OPERATIONS.sum,
          };
          break;
        case FieldMetadataType.CURRENCY:
          acc[`min${capitalize(field.name)}AmountMicros`] = {
            type: GraphQLFloat,
            description: `Minimum amount contained in the field ${field.name}`,
            fromField: field.name,
            fromSubFields: getSubfieldsForAggregateOperation(field.type),
            subFieldForNumericOperation: 'amountMicros',
            fromFieldType: field.type,
            aggregateOperation: AGGREGATE_OPERATIONS.min,
          };

          acc[`max${capitalize(field.name)}AmountMicros`] = {
            type: GraphQLFloat,
            description: `Maximal amount contained in the field ${field.name}`,
            fromField: field.name,
            fromSubFields: getSubfieldsForAggregateOperation(field.type),
            fromFieldType: field.type,
            aggregateOperation: AGGREGATE_OPERATIONS.max,
          };

          acc[`sum${capitalize(field.name)}AmountMicros`] = {
            type: GraphQLFloat,
            description: `Sum of amounts contained in the field ${field.name}`,
            fromField: field.name,
            fromSubFields: getSubfieldsForAggregateOperation(field.type),
            fromFieldType: field.type,
            aggregateOperation: AGGREGATE_OPERATIONS.sum,
          };

          acc[`avg${capitalize(field.name)}AmountMicros`] = {
            type: GraphQLFloat,
            description: `Average amount contained in the field ${field.name}`,
            fromField: field.name,
            fromSubFields: getSubfieldsForAggregateOperation(field.type),
            fromFieldType: field.type,
            aggregateOperation: AGGREGATE_OPERATIONS.avg,
          };
          break;
      }

      return acc;
    },
    {
      totalCount: {
        type: GraphQLInt,
        description: `Total number of records in the connection`,
        fromField: 'id',
        fromFieldType: FieldMetadataType.UUID,
        aggregateOperation: AGGREGATE_OPERATIONS.count,
      },
    },
  );
};
