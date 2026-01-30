import { GraphQLISODateTime } from '@nestjs/graphql';

import { GraphQLFloat, GraphQLInt, type GraphQLScalarType } from 'graphql';
import { FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION } from 'twenty-shared/constants';
import { FieldMetadataType } from 'twenty-shared/types';
import { capitalize, isFieldMetadataDateKind } from 'twenty-shared/utils';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getSubfieldsForAggregateOperation } from 'src/engine/twenty-orm/utils/get-subfields-for-aggregate-operation.util';

export type AggregationField = {
  type: GraphQLScalarType;
  description: string;
  fromField: string;
  fromFieldType: FieldMetadataType;
  fromSubFields?: string[];
  subFieldForNumericOperation?: string;
  aggregateOperation: AggregateOperations;
};

export const getAvailableAggregationsFromObjectFields = (
  fields: FlatFieldMetadata[],
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
        aggregateOperation: AggregateOperations.COUNT_UNIQUE_VALUES,
      };

      acc[`countEmpty${capitalize(field.name)}`] = {
        type: GraphQLInt,
        description: `Number of empty values for ${field.name}`,
        fromField: field.name,
        fromFieldType: field.type,
        fromSubFields,
        aggregateOperation: AggregateOperations.COUNT_EMPTY,
      };

      acc[`countNotEmpty${capitalize(field.name)}`] = {
        type: GraphQLInt,
        description: `Number of non-empty values for ${field.name}`,
        fromField: field.name,
        fromFieldType: field.type,
        fromSubFields,
        aggregateOperation: AggregateOperations.COUNT_NOT_EMPTY,
      };

      acc[`percentageEmpty${capitalize(field.name)}`] = {
        type: GraphQLFloat,
        description: `Percentage of empty values for ${field.name}`,
        fromField: field.name,
        fromFieldType: field.type,
        fromSubFields,
        aggregateOperation: AggregateOperations.PERCENTAGE_EMPTY,
      };

      acc[`percentageNotEmpty${capitalize(field.name)}`] = {
        type: GraphQLFloat,
        description: `Percentage of non-empty values for ${field.name}`,
        fromField: field.name,
        fromFieldType: field.type,
        fromSubFields,
        aggregateOperation: AggregateOperations.PERCENTAGE_NOT_EMPTY,
      };

      if (isFieldMetadataDateKind(field.type)) {
        acc[`min${capitalize(field.name)}`] = {
          type: GraphQLISODateTime,
          description: `Earliest date contained in the field ${field.name}`,
          fromField: field.name,
          fromFieldType: field.type,
          aggregateOperation: AggregateOperations.MIN,
        };

        acc[`max${capitalize(field.name)}`] = {
          type: GraphQLISODateTime,
          description: `Latest date contained in the field ${field.name}`,
          fromField: field.name,
          fromFieldType: field.type,
          aggregateOperation: AggregateOperations.MAX,
        };
      }

      switch (field.type) {
        case FieldMetadataType.BOOLEAN:
          acc[`countTrue${capitalize(field.name)}`] = {
            type: GraphQLInt,
            description: `Count of true values in the field ${field.name}`,
            fromField: field.name,
            fromFieldType: field.type,
            aggregateOperation: AggregateOperations.COUNT_TRUE,
          };

          acc[`countFalse${capitalize(field.name)}`] = {
            type: GraphQLInt,
            description: `Count of false values in the field ${field.name}`,
            fromField: field.name,
            fromFieldType: field.type,
            aggregateOperation: AggregateOperations.COUNT_FALSE,
          };
          break;

        case FieldMetadataType.NUMBER:
          acc[`min${capitalize(field.name)}`] = {
            type: GraphQLFloat,
            description: `Minimum amount contained in the field ${field.name}`,
            fromField: field.name,
            fromFieldType: field.type,
            aggregateOperation: AggregateOperations.MIN,
          };

          acc[`max${capitalize(field.name)}`] = {
            type: GraphQLFloat,
            description: `Maximum amount contained in the field ${field.name}`,
            fromField: field.name,
            fromFieldType: field.type,
            aggregateOperation: AggregateOperations.MAX,
          };

          acc[`avg${capitalize(field.name)}`] = {
            type: GraphQLFloat,
            description: `Average amount contained in the field ${field.name}`,
            fromField: field.name,
            fromFieldType: field.type,
            aggregateOperation: AggregateOperations.AVG,
          };

          acc[`sum${capitalize(field.name)}`] = {
            type: GraphQLFloat,
            description: `Sum of amounts contained in the field ${field.name}`,
            fromField: field.name,
            fromFieldType: field.type,
            aggregateOperation: AggregateOperations.SUM,
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
            aggregateOperation: AggregateOperations.MIN,
          };

          acc[`max${capitalize(field.name)}AmountMicros`] = {
            type: GraphQLFloat,
            description: `Maximal amount contained in the field ${field.name}`,
            fromField: field.name,
            fromSubFields: getSubfieldsForAggregateOperation(field.type),
            subFieldForNumericOperation: 'amountMicros',
            fromFieldType: field.type,
            aggregateOperation: AggregateOperations.MAX,
          };

          acc[`sum${capitalize(field.name)}AmountMicros`] = {
            type: GraphQLFloat,
            description: `Sum of amounts contained in the field ${field.name}`,
            fromField: field.name,
            fromSubFields: getSubfieldsForAggregateOperation(field.type),
            subFieldForNumericOperation: 'amountMicros',
            fromFieldType: field.type,
            aggregateOperation: AggregateOperations.SUM,
          };

          acc[`avg${capitalize(field.name)}AmountMicros`] = {
            type: GraphQLFloat,
            description: `Average amount contained in the field ${field.name}`,
            fromField: field.name,
            fromSubFields: getSubfieldsForAggregateOperation(field.type),
            subFieldForNumericOperation: 'amountMicros',
            fromFieldType: field.type,
            aggregateOperation: AggregateOperations.AVG,
          };
          break;
      }

      return acc;
    },
    {
      totalCount: {
        type: GraphQLInt,
        description: `Total number of records in the connection`,
        fromField: FIELD_FOR_TOTAL_COUNT_AGGREGATE_OPERATION,
        fromFieldType: FieldMetadataType.UUID,
        aggregateOperation: AggregateOperations.COUNT,
      },
    },
  );
};
