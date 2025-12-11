import { isDefined } from 'twenty-shared/utils';

import { type GraphqlQuerySelectedFieldsResult } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields.parser';
import {
  type AggregationField,
  getAvailableAggregationsFromObjectFields,
} from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export class GraphqlQuerySelectedFieldsAggregateParser {
  parse(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    graphqlSelectedFields: Partial<Record<string, any>>,
    flatObjectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
    accumulator: GraphqlQuerySelectedFieldsResult,
  ): void {
    const fields = flatObjectMetadata.fieldMetadataIds
      .map((id) => flatFieldMetadataMaps.byId[id])
      .filter(isDefined);

    const availableAggregations: Record<string, AggregationField> =
      getAvailableAggregationsFromObjectFields(fields);

    for (const selectedField of Object.keys(graphqlSelectedFields)) {
      const selectedAggregation = availableAggregations[selectedField];

      if (!selectedAggregation) {
        continue;
      }

      accumulator.aggregate[selectedField] = selectedAggregation;
    }
  }
}
