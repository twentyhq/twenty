import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { GraphQLSelectedFieldsParser } from 'src/engine/api/graphql/graphql-query-runner/parsers/graphql-selected-fields/graphql-selected-fields.parser';
import {
  ObjectMetadataMap,
  ObjectMetadataMapItem,
} from 'src/engine/api/graphql/graphql-query-runner/utils/convert-object-metadata-to-map.util';
import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import {
  deduceRelationDirection,
  RelationDirection,
} from 'src/engine/utils/deduce-relation-direction.util';

export class GraphqlSelectedFieldsRelationParser {
  private objectMetadataMap: ObjectMetadataMap;

  constructor(objectMetadataMap: ObjectMetadataMap) {
    this.objectMetadataMap = objectMetadataMap;
  }

  parseRelationField(
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

  private getReferencedObjectMetadata(
    relationMetadata: RelationMetadataEntity,
    relationDirection: RelationDirection,
  ): ObjectMetadataMapItem {
    const referencedObjectMetadata =
      relationDirection === RelationDirection.TO
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
