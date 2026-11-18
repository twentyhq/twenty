import { isDefined } from 'twenty-shared/utils';

import { type CommonSelectedFieldsResult } from 'src/engine/api/common/types/common-selected-fields-result.type';
import {
  type AggregationField,
  getAvailableAggregationsFromObjectFields,
} from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export class CommonQuerySelectedFieldsAggregateParser {
  parse({
    selectedAggregates,
    flatObjectMetadata,
    flatFieldMetadataMaps,
    accumulator,
  }: {
    selectedAggregates: string[];
    flatObjectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
    accumulator: CommonSelectedFieldsResult;
  }): void {
    const fields = flatObjectMetadata.fieldIds
      .map((id) =>
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: id,
          flatEntityMaps: flatFieldMetadataMaps,
        }),
      )
      .filter(isDefined);

    const availableAggregations: Record<string, AggregationField> =
      getAvailableAggregationsFromObjectFields(fields);

    for (const selectedField of selectedAggregates) {
      const selectedAggregation = availableAggregations[selectedField];

      if (!selectedAggregation) {
        continue;
      }

      accumulator.aggregates[selectedField] = selectedAggregation;
    }
  }
}
