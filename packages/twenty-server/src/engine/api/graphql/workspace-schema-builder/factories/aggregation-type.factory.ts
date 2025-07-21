import { Injectable } from '@nestjs/common';

import {
  AggregationField,
  getAvailableAggregationsFromObjectFields,
} from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

type AggregationGraphQLType = Pick<AggregationField, 'type' | 'description'>;

@Injectable()
export class AggregationTypeFactory {
  public create(
    objectMetadata: ObjectMetadataEntity,
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
