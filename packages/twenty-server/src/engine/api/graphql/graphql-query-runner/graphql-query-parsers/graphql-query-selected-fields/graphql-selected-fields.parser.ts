import {
  FieldMetadataType,
  compositeTypeDefinitions,
} from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';

import { GraphqlQuerySelectedFieldsAggregateParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields-aggregate.parser';
import { GraphqlQuerySelectedFieldsRelationParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields-relation.parser';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/workspace-migration/factories/composite-column-action.factory';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

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
    objectMetadataMaps: ObjectMetadataMaps,
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
        objectMetadataMaps,
      );

      return accumulator;
    }

    this.aggregateParser.parse(
      graphqlSelectedFields,
      objectMetadataMapItem,
      accumulator,
    );

    this.parseRecordFields(
      graphqlSelectedFields,
      objectMetadataMapItem,
      accumulator,
      objectMetadataMaps,
    );

    return accumulator;
  }

  private parseRecordFields(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    graphqlSelectedFields: Partial<Record<string, any>>,
    objectMetadataMapItem: ObjectMetadataItemWithFieldMaps,
    accumulator: GraphqlQuerySelectedFieldsResult,
    objectMetadataMaps: ObjectMetadataMaps,
  ): void {
    for (const fieldMetadata of Object.values(
      objectMetadataMapItem.fieldsById,
    )) {
      if (
        isFieldMetadataEntityOfType(fieldMetadata, FieldMetadataType.RELATION)
      ) {
        const joinColumnName = fieldMetadata.settings?.joinColumnName;

        if (
          isDefined(joinColumnName) &&
          isDefined(graphqlSelectedFields[joinColumnName])
        ) {
          accumulator.select[joinColumnName] = true;
        }

        const graphqlSelectedFieldValue =
          graphqlSelectedFields[fieldMetadata.name];

        if (!isDefined(graphqlSelectedFieldValue)) {
          continue;
        }

        this.graphqlQuerySelectedFieldsRelationParser.parseRelationField(
          fieldMetadata,
          fieldMetadata.name,
          graphqlSelectedFieldValue,
          accumulator,
        );

        continue;
      }

      if (
        isFieldMetadataEntityOfType(
          fieldMetadata,
          FieldMetadataType.MORPH_RELATION,
        )
      ) {
        const targetObjectMetadata =
          objectMetadataMaps.byId[fieldMetadata.relationTargetObjectMetadataId];

        if (
          !fieldMetadata.settings?.relationType ||
          !isDefined(targetObjectMetadata)
        ) {
          continue;
        }

        const joinColumnName = fieldMetadata.settings?.joinColumnName;

        if (
          isDefined(joinColumnName) &&
          isDefined(graphqlSelectedFields[joinColumnName])
        ) {
          accumulator.select[joinColumnName] = true;
        }

        const graphqlSelectedFieldValue =
          graphqlSelectedFields[fieldMetadata.name];

        if (!isDefined(graphqlSelectedFieldValue)) {
          continue;
        }

        this.graphqlQuerySelectedFieldsRelationParser.parseRelationField(
          fieldMetadata,
          fieldMetadata.name,
          graphqlSelectedFieldValue,
          accumulator,
        );

        continue;
      }

      if (isCompositeFieldMetadataType(fieldMetadata.type)) {
        const graphqlSelectedFieldValue =
          graphqlSelectedFields[fieldMetadata.name];

        if (!isDefined(graphqlSelectedFieldValue)) {
          continue;
        }

        const compositeResult = this.parseCompositeField(
          fieldMetadata,
          graphqlSelectedFieldValue,
        );

        Object.assign(accumulator.select, compositeResult);

        continue;
      }

      const graphqlSelectedFieldValue =
        graphqlSelectedFields[fieldMetadata.name];

      if (isDefined(graphqlSelectedFieldValue)) {
        accumulator.select[fieldMetadata.name] = true;
      }
    }
  }

  private parseConnectionField(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    graphqlSelectedFields: Partial<Record<string, any>>,
    objectMetadataMapItem: ObjectMetadataItemWithFieldMaps,
    accumulator: GraphqlQuerySelectedFieldsResult,
    objectMetadataMaps: ObjectMetadataMaps,
  ): void {
    this.aggregateParser.parse(
      graphqlSelectedFields,
      objectMetadataMapItem,
      accumulator,
    );

    const node = graphqlSelectedFields.edges.node;

    this.parseRecordFields(
      node,
      objectMetadataMapItem,
      accumulator,
      objectMetadataMaps,
    );
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
