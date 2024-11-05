import { GraphQLISODateTime } from '@nestjs/graphql';

import { GraphQLString } from 'graphql';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { capitalize } from 'src/utils/capitalize';

enum AGGREGATIONS_TYPES {
  min = 'MIN',
  max = 'MAX',
  avg = 'Avg',
}

type AggregationValue = {
  type: typeof GraphQLString;
  description: string;
  fromField: string;
  aggregationType: AGGREGATIONS_TYPES;
};

type AggregationField = {
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
            aggregationType: AGGREGATIONS_TYPES.min,
          },
        },
        {
          [`max${capitalize(field.name)}`]: {
            type: GraphQLISODateTime,
            description: `Most recent date contained in the field ${field.name}`,
            fromField: field.name,
            aggregationType: AGGREGATIONS_TYPES.max,
          },
        },
      ];
    }

    return acc;
  }, []);
};
