import { capitalize } from 'twenty-shared/utils';

import { GraphqlQuerySelectedFieldsAggregateParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields-aggregate.parser';
import { GraphqlQuerySelectedFieldsRelationParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields-relation.parser';
import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { CompositeFieldMetadataType } from 'src/engine/metadata-modules/workspace-migration/factories/composite-column-action.factory';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';

export type GraphqlQuerySelectedFieldsResult = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  select: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  relations: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    graphqlSelectedFields: Partial<Record<string, any>>,
    objectMetadataMapItem: ObjectMetadataItemWithFieldMaps,
  ): GraphqlQuerySelectedFieldsResult {
    const accumulator: GraphqlQuerySelectedFieldsResult = {
      select: {},
      relations: {},
      aggregate: {},
    };

    if (this.isRootConnection(graphqlSelectedFields)) {
      this.parseConnectionField(
        graphqlSelectedFields,
        objectMetadataMapItem,
        accumulator,
      );

      return accumulator;
    }

    this.aggregateParser.parse(
      graphqlSelectedFields,
      objectMetadataMapItem,
      accumulator,
    );

    this.parseRecordField(
      graphqlSelectedFields,
      objectMetadataMapItem,
      accumulator,
    );

    return accumulator;
  }

  private parseRecordField(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    graphqlSelectedFields: Partial<Record<string, any>>,
    objectMetadataMapItem: ObjectMetadataItemWithFieldMaps,
    accumulator: GraphqlQuerySelectedFieldsResult,
  ): void {
    for (const [fieldKey, fieldValue] of Object.entries(
      graphqlSelectedFields,
    )) {
      const fieldMetadataBasedOnName =
        objectMetadataMapItem.fieldsById[
          objectMetadataMapItem.fieldIdByName[fieldKey]
        ];

      const isFieldForeignKey =
        !fieldMetadataBasedOnName && fieldKey.endsWith('Id');

      if (isFieldForeignKey) {
        const fieldMetadataBasedOnRelationName =
          objectMetadataMapItem.fieldsById[
            objectMetadataMapItem.fieldIdByName[fieldKey.slice(0, -2)]
          ];

        if (fieldMetadataBasedOnRelationName) {
          accumulator.select[fieldKey] = true; // field is not a connection so should not be treated as a relation
          continue;
        }
      }

      const fieldMetadata = fieldMetadataBasedOnName;

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    graphqlSelectedFields: Partial<Record<string, any>>,
    objectMetadataMapItem: ObjectMetadataItemWithFieldMaps,
    accumulator: GraphqlQuerySelectedFieldsResult,
  ): void {
    this.aggregateParser.parse(
      graphqlSelectedFields,
      objectMetadataMapItem,
      accumulator,
    );

    const node = graphqlSelectedFields.edges.node;

    this.parseRecordField(node, objectMetadataMapItem, accumulator);
  }

  private isRootConnection(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    graphqlSelectedFields: Partial<Record<string, any>>,
  ): boolean {
    return Object.keys(graphqlSelectedFields).includes('edges');
  }

  private parseCompositeField(
    fieldMetadata: FieldMetadataEntity,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fieldValue: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {} as Record<string, any>,
      );
  }
}
