import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { GraphqlQuerySelectedFieldsResult } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields.parser';
import {
  AggregationField,
  getAvailableAggregationsFromObjectFields,
} from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';

export class GraphqlQuerySelectedFieldsAggregateParser {
  parse(
    graphqlSelectedFields: Partial<Record<string, any>>,
    fieldMetadataMapByName: Record<string, FieldMetadataInterface>,
    accumulator: GraphqlQuerySelectedFieldsResult,
  ): void {
    const availableAggregations: Record<string, AggregationField> =
      getAvailableAggregationsFromObjectFields(
        Object.values(fieldMetadataMapByName),
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
