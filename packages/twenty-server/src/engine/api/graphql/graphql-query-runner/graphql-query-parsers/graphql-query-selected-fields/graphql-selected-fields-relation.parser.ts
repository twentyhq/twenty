import {
  GraphqlQuerySelectedFieldsParser,
  GraphqlQuerySelectedFieldsResult,
} from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields.parser';
import { getTargetObjectMetadataOrThrow } from 'src/engine/api/graphql/graphql-query-runner/utils/get-target-object-metadata.util';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

export class GraphqlQuerySelectedFieldsRelationParser {
  private objectMetadataMaps: ObjectMetadataMaps;

  constructor(objectMetadataMaps: ObjectMetadataMaps) {
    this.objectMetadataMaps = objectMetadataMaps;
  }

  parseRelationField(
    fieldMetadata: FieldMetadataEntity,
    fieldKey: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fieldValue: any,
    accumulator: GraphqlQuerySelectedFieldsResult,
  ): void {
    if (!fieldValue || typeof fieldValue !== 'object') {
      return;
    }

    accumulator.relations[fieldKey] = true;

    const targetObjectMetadata = getTargetObjectMetadataOrThrow(
      fieldMetadata,
      this.objectMetadataMaps,
    );

    const fieldParser = new GraphqlQuerySelectedFieldsParser(
      this.objectMetadataMaps,
    );
    const relationAccumulator = fieldParser.parse(
      fieldValue,
      targetObjectMetadata,
    );

    accumulator.select[fieldKey] = {
      id: true,
      ...relationAccumulator.select,
    };
    accumulator.relations[fieldKey] = relationAccumulator.relations;
    accumulator.aggregate[fieldKey] = relationAccumulator.aggregate;
  }
}
