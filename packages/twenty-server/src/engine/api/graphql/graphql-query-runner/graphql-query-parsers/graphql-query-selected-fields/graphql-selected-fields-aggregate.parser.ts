import { type FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { type GraphqlQuerySelectedFieldsResult } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields.parser';
import {
  type AggregationField,
  getAvailableAggregationsFromObjectFields,
} from 'src/engine/api/graphql/workspace-schema-builder/utils/get-available-aggregations-from-object-fields.util';
import { isAggregatableThroughRelationFlatFieldMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/is-aggregatable-through-relation-flat-field-metadata.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type GraphqlQuerySelectedFieldsAggregateParseResult = {
  relationFieldNamesSelectedAsAggregations: string[];
};

export class GraphqlQuerySelectedFieldsAggregateParser {
  private flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  private flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;

  constructor(
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>,
  ) {
    this.flatObjectMetadataMaps = flatObjectMetadataMaps;
    this.flatFieldMetadataMaps = flatFieldMetadataMaps;
  }

  parse(
    // oxlint-disable-next-line typescript/no-explicit-any
    graphqlSelectedFields: Partial<Record<string, any>>,
    flatObjectMetadata: FlatObjectMetadata,
    accumulator: GraphqlQuerySelectedFieldsResult,
  ): GraphqlQuerySelectedFieldsAggregateParseResult {
    const fields = this.getFlatFields(flatObjectMetadata);

    const availableAggregations: Record<string, AggregationField> =
      getAvailableAggregationsFromObjectFields(fields);

    const relationFieldNamesSelectedAsAggregations: string[] = [];

    for (const [selectedField, selectedValue] of Object.entries(
      graphqlSelectedFields,
    )) {
      const selectedAggregation = availableAggregations[selectedField];

      if (isDefined(selectedAggregation)) {
        accumulator.aggregate[selectedField] = selectedAggregation;
        continue;
      }

      const relationFieldMetadata = fields.find(
        (field) => field.name === selectedField,
      );

      if (
        !isDefined(relationFieldMetadata) ||
        !isAggregatableThroughRelationFlatFieldMetadata(
          relationFieldMetadata,
        ) ||
        !isPlainObject(selectedValue)
      ) {
        continue;
      }

      const wasParsedAsAggregation = this.parseAggregationsThroughRelation({
        relationFieldMetadata,
        selectedSubFields: Object.keys(selectedValue).filter(
          (subField) => subField !== '__typename',
        ),
        accumulator,
      });

      if (wasParsedAsAggregation) {
        relationFieldNamesSelectedAsAggregations.push(selectedField);
      }
    }

    return { relationFieldNamesSelectedAsAggregations };
  }

  private parseAggregationsThroughRelation({
    relationFieldMetadata,
    selectedSubFields,
    accumulator,
  }: {
    relationFieldMetadata: OrmFlatFieldMetadata<FieldMetadataType.RELATION>;
    selectedSubFields: string[];
    accumulator: GraphqlQuerySelectedFieldsResult;
  }): boolean {
    const targetObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: relationFieldMetadata.relationTargetObjectMetadataId,
      flatEntityMaps: this.flatObjectMetadataMaps,
    });

    if (!isDefined(targetObjectMetadata)) {
      return false;
    }

    const targetFields = this.getFlatFields(targetObjectMetadata);
    const targetAggregations =
      getAvailableAggregationsFromObjectFields(targetFields);

    // The same key names a relation on the node type and an Aggregation on the connection type; only an all-aggregation sub-selection is the latter
    const isAggregationSelection =
      selectedSubFields.length > 0 &&
      selectedSubFields.every((subField) =>
        isDefined(targetAggregations[subField]),
      );

    if (!isAggregationSelection) {
      return false;
    }

    for (const subField of selectedSubFields) {
      const targetAggregation = targetAggregations[subField];
      const targetFieldMetadata = targetFields.find(
        (field) => field.name === targetAggregation.fromField,
      );

      if (!isDefined(targetFieldMetadata)) {
        continue;
      }

      accumulator.aggregate[`${relationFieldMetadata.name}.${subField}`] = {
        ...targetAggregation,
        throughRelation: {
          relationFieldName: relationFieldMetadata.name,
          relationFieldMetadata,
          targetObjectMetadata,
          targetFieldMetadata,
          targetAggregationName: subField,
        },
      } satisfies AggregationField;
    }

    return true;
  }

  private getFlatFields(
    flatObjectMetadata: FlatObjectMetadata,
  ): OrmFlatFieldMetadata[] {
    return flatObjectMetadata.fieldIds
      .map((id) =>
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: id,
          flatEntityMaps: this.flatFieldMetadataMaps,
        }),
      )
      .filter(isDefined);
  }
}
