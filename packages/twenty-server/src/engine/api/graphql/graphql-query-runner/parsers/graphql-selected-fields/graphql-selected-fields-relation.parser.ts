import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { GraphQLSelectedFieldsParser } from 'src/engine/api/graphql/graphql-query-runner/parsers/graphql-selected-fields/graphql-selected-fields.parser';
import {
  deduceRelationDirection,
  RelationDirection,
} from 'src/engine/utils/deduce-relation-direction.util';

export class GraphqlSelectedFieldsRelationParser {
  private objectMetadataMap: Record<string, any>;

  constructor(objectMetadataMap: Record<string, any>) {
    this.objectMetadataMap = objectMetadataMap;
  }

  /**
   * Handles the processing of a relation field in the GraphQL selected fields parser.
   *
   * @param fieldMetadata - The metadata for the current field.
   * @param fieldKey - The key of the current field.
   * @param fieldValue - The value of the current field.
   * @param result - The result object to store the selected fields and relations.
   */
  handleRelationField(
    fieldMetadata: FieldMetadataInterface,
    fieldKey: string,
    fieldValue: any,
    result: { select: Record<string, any>; relations: Record<string, any> },
  ): void {
    result.relations[fieldKey] = true;

    if (!fieldValue || typeof fieldValue !== 'object') {
      return;
    }

    const relationMetadata =
      fieldMetadata.fromRelationMetadata ?? fieldMetadata.toRelationMetadata;

    if (!relationMetadata) {
      throw new Error(
        `Relation metadata not found for field ${fieldMetadata.name}`,
      );
    }

    const relationDirection = deduceRelationDirection(
      fieldMetadata,
      relationMetadata,
    );
    const referencedObjectMetadata = this.getReferencedObjectMetadata(
      relationMetadata,
      relationDirection,
    );

    const relationFields = referencedObjectMetadata.fields;
    const fieldParser = new GraphQLSelectedFieldsParser(this.objectMetadataMap);
    const subResult = fieldParser.parse(fieldValue, relationFields);

    result.select[fieldKey] = {
      id: true,
      ...subResult.select,
    };
    result.relations[fieldKey] = subResult.relations;
  }

  /**
   * Retrieves the metadata for the object referenced by the given relation metadata, based on the specified relation direction.
   *
   * @param relationMetadata - The relation metadata containing information about the referenced object.
   * @param relationDirection - The direction of the relation, either 'TO' or 'FROM'.
   * @returns The metadata for the referenced object.
   * @throws Error if the referenced object metadata is not found.
   */
  private getReferencedObjectMetadata(
    relationMetadata: any,
    relationDirection: RelationDirection,
  ): any {
    const referencedObjectMetadata =
      relationDirection == RelationDirection.TO
        ? this.objectMetadataMap[relationMetadata.fromObjectMetadataId]
        : this.objectMetadataMap[relationMetadata.toObjectMetadataId];

    if (!referencedObjectMetadata) {
      throw new Error(
        `Referenced object metadata not found for relation ${relationMetadata.id}`,
      );
    }

    return referencedObjectMetadata;
  }
}
