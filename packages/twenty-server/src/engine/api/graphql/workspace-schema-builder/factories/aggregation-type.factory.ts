import { Injectable } from '@nestjs/common';

import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import {
  AggregationField,
  getAvailableAggregationsFromObjectFields,
} from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';

type AggregationGraphQLType = Pick<AggregationField, 'type' | 'description'>;

@Injectable()
export class AggregationTypeFactory {
  public create(
    objectMetadata: ObjectMetadataInterface,
  ): Record<string, AggregationGraphQLType> {
    const availableAggregations = getAvailableAggregationsFromObjectFields(
      objectMetadata.fields,
    );

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
