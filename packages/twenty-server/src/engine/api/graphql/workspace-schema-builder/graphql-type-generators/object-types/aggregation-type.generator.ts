import { Injectable } from '@nestjs/common';

import {
  type AggregationField,
  getAvailableAggregationsFromObjectFields,
} from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

type AggregationGraphQLType = Pick<AggregationField, 'type' | 'description'>;

@Injectable()
export class AggregationObjectTypeGenerator {
  public generate(
    flatFields: FlatFieldMetadata[],
  ): Record<string, AggregationGraphQLType> {
    const availableAggregations =
      getAvailableAggregationsFromObjectFields(flatFields);

    return Object.entries(availableAggregations).reduce<
      Record<string, AggregationGraphQLType>
    >((acc, [key, agg]) => {
      acc[key] = {
        type: agg.type,
        description: agg.description,
      };

      return acc;
    }, {});
  }
}
