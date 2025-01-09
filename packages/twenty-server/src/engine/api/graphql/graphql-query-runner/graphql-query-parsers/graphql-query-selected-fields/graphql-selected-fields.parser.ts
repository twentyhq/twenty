import { capitalize } from 'twenty-shared';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { GraphqlQuerySelectedFieldsAggregateParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields-aggregate.parser';
import { GraphqlQuerySelectedFieldsRelationParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields-relation.parser';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { CompositeFieldMetadataType } from 'src/engine/metadata-modules/workspace-migration/factories/composite-column-action.factory';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';

export type GraphqlQuerySelectedFieldsResult = {
  select: Record<string, any>;
  relations: Record<string, any>;
  aggregate: Record<string, any>;
};

export class GraphqlQuerySelectedFieldsParser {
  private graphqlQuerySelectedFieldsRelationParser: GraphqlQuerySelectedFieldsRelationParser;
  private aggregateParser: GraphqlQuerySelectedFieldsAggregateParser;

  constructor(objectMetadataMaps: ObjectMetadataMaps) {
    this.graphqlQuerySelectedFieldsRelationParser =
      new GraphqlQuerySelectedFieldsRelationParser(objectMetadataMaps);
    this.aggregateParser = new GraphqlQuerySelectedFieldsAggregateParser();
  }

  parse(
    graphqlSelectedFields: Partial<Record<string, any>>,
    fieldMetadataMapByName: Record<string, FieldMetadataInterface>,
  ): GraphqlQuerySelectedFieldsResult {
    const accumulator: GraphqlQuerySelectedFieldsResult = {
      select: {},
      relations: {},
      aggregate: {},
    };

    if (this.isRootConnection(graphqlSelectedFields)) {
      this.parseConnectionField(
        graphqlSelectedFields,
        fieldMetadataMapByName,
        accumulator,
      );

      return accumulator;
    }

    this.aggregateParser.parse(
      graphqlSelectedFields,
      fieldMetadataMapByName,
      accumulator,
    );

    this.parseRecordField(
      graphqlSelectedFields,
      fieldMetadataMapByName,
      accumulator,
    );

    return accumulator;
  }

  private parseRecordField(
    graphqlSelectedFields: Partial<Record<string, any>>,
    fieldMetadataMapByName: Record<string, FieldMetadataInterface>,
    accumulator: GraphqlQuerySelectedFieldsResult,
  ): void {
    for (const [fieldKey, fieldValue] of Object.entries(
      graphqlSelectedFields,
    )) {
      const fieldMetadata = fieldMetadataMapByName[fieldKey];

      if (!fieldMetadata) {
        continue;
      }

      if (isRelationFieldMetadataType(fieldMetadata.type)) {
        this.graphqlQuerySelectedFieldsRelationParser.parseRelationField(
          fieldMetadata,
          fieldKey,
          fieldValue,
          accumulator,
        );
      } else if (isCompositeFieldMetadataType(fieldMetadata.type)) {
        const compositeResult = this.parseCompositeField(
          fieldMetadata,
          fieldValue,
        );

        Object.assign(accumulator.select, compositeResult);
      } else {
        accumulator.select[fieldKey] = true;
      }
    }
  }

  private parseConnectionField(
    graphqlSelectedFields: Partial<Record<string, any>>,
    fieldMetadataMapByName: Record<string, FieldMetadataInterface>,
    accumulator: GraphqlQuerySelectedFieldsResult,
  ): void {
    this.aggregateParser.parse(
      graphqlSelectedFields,
      fieldMetadataMapByName,
      accumulator,
    );

    const node = graphqlSelectedFields.edges.node;

    this.parseRecordField(node, fieldMetadataMapByName, accumulator);
  }

  private isRootConnection(
    graphqlSelectedFields: Partial<Record<string, any>>,
  ): boolean {
    return Object.keys(graphqlSelectedFields).includes('edges');
  }

  private parseCompositeField(
    fieldMetadata: FieldMetadataInterface,
    fieldValue: any,
  ): Record<string, any> {
    const compositeType = compositeTypeDefinitions.get(
      fieldMetadata.type as CompositeFieldMetadataType,
    );

    if (!compositeType) {
      throw new Error(
        `Composite type definition not found for type: ${fieldMetadata.type}`,
      );
    }

    return Object.keys(fieldValue)
      .filter((subFieldKey) => subFieldKey !== '__typename')
      .reduce(
        (acc, subFieldKey) => {
          const subFieldMetadata = compositeType.properties.find(
            (property) => property.name === subFieldKey,
          );

          if (!subFieldMetadata) {
            throw new Error(
              `Sub field metadata not found for composite type: ${fieldMetadata.type}`,
            );
          }

          const fullFieldName = `${fieldMetadata.name}${capitalize(subFieldKey)}`;

          acc[fullFieldName] = true;

          return acc;
        },
        {} as Record<string, any>,
      );
  }
}
