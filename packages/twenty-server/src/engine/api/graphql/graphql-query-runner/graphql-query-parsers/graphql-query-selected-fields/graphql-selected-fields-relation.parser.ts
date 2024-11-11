import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { GraphqlQuerySelectedFieldsParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields.parser';
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
    result: { select: Record<string, any>; relations: Record<string, any> },
  ): void {
    if (!fieldValue || typeof fieldValue !== 'object') {
      return;
    }

    result.relations[fieldKey] = true;

    const referencedObjectMetadata = getRelationObjectMetadata(
      fieldMetadata,
      this.objectMetadataMaps,
    );

    const relationFields = referencedObjectMetadata.fieldsByName;
    const fieldParser = new GraphqlQuerySelectedFieldsParser(
      this.objectMetadataMaps,
    );
    const subResult = fieldParser.parse(fieldValue, relationFields);

    result.select[fieldKey] = {
      id: true,
      ...subResult.select,
    };
    result.relations[fieldKey] = subResult.relations;
  }
}
