import { GraphQLISODateTime } from '@nestjs/graphql';

import { GraphQLFloat, GraphQLInt, GraphQLScalarType } from 'graphql';
import {
  getColumnNameForAggregateOperation,
  getSubfieldForAggregateOperation,
} from 'twenty-shared';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { AGGREGATE_OPERATIONS } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { capitalize } from 'src/utils/capitalize';

export type AggregationField = {
  type: GraphQLScalarType;
  description: string;
  fromField: string;
  fromFieldType: FieldMetadataType;
  fromSubField?: string;
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

      const columnName = getColumnNameForAggregateOperation(
        field.name,
        field.type,
      );

      const fromSubField = getSubfieldForAggregateOperation(field.type);

      acc[`countUniqueValues${capitalize(columnName)}`] = {
        type: GraphQLInt,
        description: `Number of unique values for ${field.name}`,
        fromField: field.name,
        fromFieldType: field.type,
        fromSubField,
        aggregateOperation: AGGREGATE_OPERATIONS.countUniqueValues,
      };

      acc[`countEmpty${capitalize(columnName)}`] = {
        type: GraphQLInt,
        description: `Number of empty values for ${field.name}`,
        fromField: field.name,
        fromFieldType: field.type,
        fromSubField,
        aggregateOperation: AGGREGATE_OPERATIONS.countEmpty,
      };

      acc[`countNotEmpty${capitalize(columnName)}`] = {
        type: GraphQLInt,
        description: `Number of non-empty values for ${field.name}`,
        fromField: field.name,
        fromFieldType: field.type,
        fromSubField,
        aggregateOperation: AGGREGATE_OPERATIONS.countNotEmpty,
      };

      acc[`percentageEmpty${capitalize(columnName)}`] = {
        type: GraphQLFloat,
        description: `Percentage of empty values for ${field.name}`,
        fromField: field.name,
        fromFieldType: field.type,
        fromSubField,
        aggregateOperation: AGGREGATE_OPERATIONS.percentageEmpty,
      };

      acc[`percentageNotEmpty${capitalize(columnName)}`] = {
        type: GraphQLFloat,
        description: `Percentage of non-empty values for ${field.name}`,
        fromField: field.name,
        fromFieldType: field.type,
        fromSubField,
        aggregateOperation: AGGREGATE_OPERATIONS.percentageNotEmpty,
      };

      switch (field.type) {
        case FieldMetadataType.DATE_TIME:
          acc[`min${capitalize(field.name)}`] = {
            type: GraphQLISODateTime,
            description: `Oldest date contained in the field ${field.name}`,
            fromField: field.name,
            fromFieldType: field.type,
            aggregateOperation: AGGREGATE_OPERATIONS.min,
          };

          acc[`max${capitalize(field.name)}`] = {
            type: GraphQLISODateTime,
            description: `Most recent date contained in the field ${field.name}`,
            fromField: field.name,
            fromFieldType: field.type,
            aggregateOperation: AGGREGATE_OPERATIONS.max,
          };
          break;
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
            fromSubField: 'amountMicros',
            fromFieldType: field.type,
            aggregateOperation: AGGREGATE_OPERATIONS.min,
          };

          acc[`max${capitalize(field.name)}AmountMicros`] = {
            type: GraphQLFloat,
            description: `Maximal amount contained in the field ${field.name}`,
            fromField: field.name,
            fromSubField: 'amountMicros',
            fromFieldType: field.type,
            aggregateOperation: AGGREGATE_OPERATIONS.max,
          };

          acc[`sum${capitalize(field.name)}AmountMicros`] = {
            type: GraphQLFloat,
            description: `Sum of amounts contained in the field ${field.name}`,
            fromField: field.name,
            fromSubField: 'amountMicros',
            fromFieldType: field.type,
            aggregateOperation: AGGREGATE_OPERATIONS.sum,
          };

          acc[`avg${capitalize(field.name)}AmountMicros`] = {
            type: GraphQLFloat,
            description: `Average amount contained in the field ${field.name}`,
            fromField: field.name,
            fromSubField: 'amountMicros',
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
