import {
  FieldMetadataType,
  compositeTypeDefinitions,
} from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';

import { GraphqlQuerySelectedFieldsAggregateParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields-aggregate.parser';
import { GraphqlQuerySelectedFieldsRelationParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields-relation.parser';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/workspace-migration/factories/composite-column-action.factory';

export type GraphqlQuerySelectedFieldsResult = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  select: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  relations: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  aggregate: Record<string, any>;
  relationFieldsCount: number;
  hasAtLeastTwoNestedOneToManyRelations: boolean;
};

export class GraphqlQuerySelectedFieldsParser {
  private graphqlQuerySelectedFieldsRelationParser: GraphqlQuerySelectedFieldsRelationParser;
  private aggregateParser: GraphqlQuerySelectedFieldsAggregateParser;
  private flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  private flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;

  constructor(
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ) {
    this.flatObjectMetadataMaps = flatObjectMetadataMaps;
    this.flatFieldMetadataMaps = flatFieldMetadataMaps;
    this.graphqlQuerySelectedFieldsRelationParser =
      new GraphqlQuerySelectedFieldsRelationParser(
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      );
    this.aggregateParser = new GraphqlQuerySelectedFieldsAggregateParser();
  }

  parse(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    graphqlSelectedFields: Partial<Record<string, any>>,
    flatObjectMetadata: FlatObjectMetadata,
    isFromOneToManyRelation?: boolean,
  ): GraphqlQuerySelectedFieldsResult {
    const accumulator: GraphqlQuerySelectedFieldsResult = {
      select: {},
      relations: {},
      aggregate: {},
      relationFieldsCount: 0,
      hasAtLeastTwoNestedOneToManyRelations: false,
    };

    if (this.isRootConnection(graphqlSelectedFields)) {
      this.parseConnectionField(
        graphqlSelectedFields,
        flatObjectMetadata,
        accumulator,
        isFromOneToManyRelation,
      );

      return accumulator;
    }

    this.aggregateParser.parse(
      graphqlSelectedFields,
      flatObjectMetadata,
      this.flatFieldMetadataMaps,
      accumulator,
    );

    this.parseRecordFields(
      graphqlSelectedFields,
      flatObjectMetadata,
      accumulator,
      isFromOneToManyRelation,
    );

    return accumulator;
  }

  private parseRecordFields(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    graphqlSelectedFields: Partial<Record<string, any>>,
    flatObjectMetadata: FlatObjectMetadata,
    accumulator: GraphqlQuerySelectedFieldsResult,
    isFromOneToManyRelation?: boolean,
  ): void {
    for (const fieldMetadataId of flatObjectMetadata.fieldMetadataIds) {
      const fieldMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: fieldMetadataId,
        flatEntityMaps: this.flatFieldMetadataMaps,
      });

      if (
        isFlatFieldMetadataOfType(fieldMetadata, FieldMetadataType.RELATION)
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
          isFromOneToManyRelation,
        );

        continue;
      }

      if (
        isFlatFieldMetadataOfType(
          fieldMetadata,
          FieldMetadataType.MORPH_RELATION,
        )
      ) {
        const targetObjectMetadata =
          this.flatObjectMetadataMaps.byId[
            fieldMetadata.relationTargetObjectMetadataId
          ];

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
          isFromOneToManyRelation,
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
    flatObjectMetadata: FlatObjectMetadata,
    accumulator: GraphqlQuerySelectedFieldsResult,
    isFromOneToManyRelation?: boolean,
  ): void {
    this.aggregateParser.parse(
      graphqlSelectedFields,
      flatObjectMetadata,
      this.flatFieldMetadataMaps,
      accumulator,
    );

    const node = graphqlSelectedFields.edges.node;

    this.parseRecordFields(
      node,
      flatObjectMetadata,
      accumulator,
      isFromOneToManyRelation,
    );
  }

  private isRootConnection(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    graphqlSelectedFields: Partial<Record<string, any>>,
  ): boolean {
    return Object.keys(graphqlSelectedFields).includes('edges');
  }

  private parseCompositeField(
    fieldMetadata: FlatFieldMetadata,
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
