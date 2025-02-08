import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import {
  GraphqlQuerySelectedFieldsParser,
  GraphqlQuerySelectedFieldsResult,
} from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields.parser';
import { getRelationObjectMetadata } from 'src/engine/api/graphql/graphql-query-runner/utils/get-relation-object-metadata.util';
import { getTargetObjectMetadataOrThrow } from 'src/engine/api/graphql/graphql-query-runner/utils/get-target-object-metadata.util';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

export class GraphqlQuerySelectedFieldsRelationParser {
  private objectMetadataMaps: ObjectMetadataMaps;
  private featureFlagsMap: FeatureFlagMap;

  constructor(
    objectMetadataMaps: ObjectMetadataMaps,
    featureFlagsMap: FeatureFlagMap,
  ) {
    this.objectMetadataMaps = objectMetadataMaps;
    this.featureFlagsMap = featureFlagsMap;
  }

  parseRelationField(
    fieldMetadata: FieldMetadataInterface,
    fieldKey: string,
    fieldValue: any,
    accumulator: GraphqlQuerySelectedFieldsResult,
  ): void {
    if (!fieldValue || typeof fieldValue !== 'object') {
      return;
    }

    accumulator.relations[fieldKey] = true;

    const isNewRelationEnabled =
      this.featureFlagsMap[FeatureFlagKey.IsNewRelationEnabled];

    const targetObjectMetadata = isNewRelationEnabled
      ? getTargetObjectMetadataOrThrow(fieldMetadata, this.objectMetadataMaps)
      : getRelationObjectMetadata(fieldMetadata, this.objectMetadataMaps);

    const targetFields = targetObjectMetadata.fieldsByName;
    const fieldParser = new GraphqlQuerySelectedFieldsParser(
      this.objectMetadataMaps,
      this.featureFlagsMap,
    );
    const relationAccumulator = fieldParser.parse(fieldValue, targetFields);

    accumulator.select[fieldKey] = {
      id: true,
      ...relationAccumulator.select,
    };
    accumulator.relations[fieldKey] = relationAccumulator.relations;
    accumulator.aggregate[fieldKey] = relationAccumulator.aggregate;
  }
}
