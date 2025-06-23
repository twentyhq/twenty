import { GraphqlQuerySelectedFieldsResult } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields.parser';
import {
  AggregationField,
  getAvailableAggregationsFromObjectFields,
} from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

export class GraphqlQuerySelectedFieldsAggregateParser {
  parse(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    graphqlSelectedFields: Partial<Record<string, any>>,
    objectMetadataMapItem: ObjectMetadataItemWithFieldMaps,
    accumulator: GraphqlQuerySelectedFieldsResult,
  ): void {
    const availableAggregations: Record<string, AggregationField> =
      getAvailableAggregationsFromObjectFields(
        Object.values(objectMetadataMapItem.fieldsById),
      );

    for (const selectedField of Object.keys(graphqlSelectedFields)) {
      const selectedAggregation = availableAggregations[selectedField];

      if (!selectedAggregation) {
        continue;
      }

      accumulator.aggregate[selectedField] = selectedAggregation;
    }
  }
}
