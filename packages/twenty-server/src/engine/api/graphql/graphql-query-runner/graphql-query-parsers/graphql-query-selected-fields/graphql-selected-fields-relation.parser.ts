import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import {
  GraphqlQuerySelectedFieldsParser,
  GraphqlQuerySelectedFieldsResult,
} from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields.parser';
import { getRelationObjectMetadata } from 'src/engine/api/graphql/graphql-query-runner/utils/get-relation-object-metadata.util';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

export class GraphqlQuerySelectedFieldsRelationParser {
  private objectMetadataMaps: ObjectMetadataMaps;

  constructor(objectMetadataMaps: ObjectMetadataMaps) {
    this.objectMetadataMaps = objectMetadataMaps;
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

    const referencedObjectMetadata = getRelationObjectMetadata(
      fieldMetadata,
      this.objectMetadataMaps,
    );

    const relationFields = referencedObjectMetadata.fieldsByName;
    const fieldParser = new GraphqlQuerySelectedFieldsParser(
      this.objectMetadataMaps,
    );
    const relationAccumulator = fieldParser.parse(fieldValue, relationFields);

    accumulator.select[fieldKey] = {
      id: true,
      ...relationAccumulator.select,
    };
    accumulator.relations[fieldKey] = relationAccumulator.relations;
    accumulator.aggregate[fieldKey] = relationAccumulator.aggregate;
  }
}
