import {
  FieldMetadataType,
  compositeTypeDefinitions,
} from 'twenty-shared/types';
import {
  capitalize,
  isDefined,
  isMorphRelationHead,
} from 'twenty-shared/utils';

import { type CommonSelectedFieldsResult } from 'src/engine/api/common/types/common-selected-fields-result.type';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { GraphqlQuerySelectedFieldsAggregateParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields-aggregate.parser';
import { GraphqlQuerySelectedFieldsRelationParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields-relation.parser';
import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/composite-field-metadata-type.type';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { getFieldNameFromSelectionKey } from 'src/engine/api/graphql/workspace-resolver-builder/utils/compute-selection-key.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

const isFieldSelected = ({
  graphqlSelectedFields,
  fieldName,
}: {
  graphqlSelectedFields: Partial<Record<string, unknown>>;
  fieldName: string;
}): boolean =>
  Object.prototype.hasOwnProperty.call(graphqlSelectedFields, fieldName);

const groupSelectionKeysByFieldName = (
  graphqlSelectedFields: Partial<Record<string, unknown>>,
): Map<string, string[]> => {
  const selectionKeysByFieldName = new Map<string, string[]>();

  for (const selectionKey of Object.keys(graphqlSelectedFields)) {
    const fieldName = getFieldNameFromSelectionKey(selectionKey);

    selectionKeysByFieldName.set(fieldName, [
      ...(selectionKeysByFieldName.get(fieldName) ?? []),
      selectionKey,
    ]);
  }

  return selectionKeysByFieldName;
};

export class GraphqlQuerySelectedFieldsParser {
  private graphqlQuerySelectedFieldsRelationParser: GraphqlQuerySelectedFieldsRelationParser;
  private aggregateParser: GraphqlQuerySelectedFieldsAggregateParser;
  private flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  private flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;

  constructor(
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>,
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
    // oxlint-disable-next-line typescript/no-explicit-any
    graphqlSelectedFields: Partial<Record<string, any>>,
    flatObjectMetadata: FlatObjectMetadata,
    isFromOneToManyRelation?: boolean,
  ): CommonSelectedFieldsResult {
    const accumulator: CommonSelectedFieldsResult = {
      columns: {},
      aggregates: {},
      relations: {},
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
    // oxlint-disable-next-line typescript/no-explicit-any
    graphqlSelectedFields: Partial<Record<string, any>>,
    flatObjectMetadata: FlatObjectMetadata,
    accumulator: CommonSelectedFieldsResult,
    isFromOneToManyRelation?: boolean,
  ): void {
    const selectionKeysByFieldName = groupSelectionKeysByFieldName(
      graphqlSelectedFields,
    );

    for (const fieldMetadataId of flatObjectMetadata.fieldIds) {
      const fieldMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: fieldMetadataId,
        flatEntityMaps: this.flatFieldMetadataMaps,
      });

      if (
        isFlatFieldMetadataOfType(fieldMetadata, FieldMetadataType.RELATION)
      ) {
        this.parseRelationSelections({
          fieldMetadata,
          graphqlSelectedFields,
          selectionKeys: selectionKeysByFieldName.get(fieldMetadata.name),
          accumulator,
          isFromOneToManyRelation,
        });

        continue;
      }

      if (
        isFlatFieldMetadataOfType(
          fieldMetadata,
          FieldMetadataType.MORPH_RELATION,
        ) &&
        !isMorphRelationHead(fieldMetadata)
      ) {
        const targetObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: fieldMetadata.relationTargetObjectMetadataId,
          flatEntityMaps: this.flatObjectMetadataMaps,
        });

        if (
          !fieldMetadata.settings?.relationType ||
          !isDefined(targetObjectMetadata)
        ) {
          continue;
        }

        this.parseRelationSelections({
          fieldMetadata,
          graphqlSelectedFields,
          selectionKeys: selectionKeysByFieldName.get(fieldMetadata.name),
          accumulator,
          isFromOneToManyRelation,
        });

        continue;
      }

      if (
        !isFieldSelected({
          graphqlSelectedFields,
          fieldName: fieldMetadata.name,
        })
      ) {
        continue;
      }

      if (isCompositeFieldMetadataType(fieldMetadata.type)) {
        Object.assign(
          accumulator.columns,
          this.parseCompositeField(
            fieldMetadata,
            graphqlSelectedFields[fieldMetadata.name],
          ),
        );

        continue;
      }

      accumulator.columns[fieldMetadata.name] = true;
    }
  }

  // A relation appears once per distinct set of arguments, each under its own selection key
  private parseRelationSelections({
    fieldMetadata,
    graphqlSelectedFields,
    selectionKeys = [],
    accumulator,
    isFromOneToManyRelation,
  }: {
    fieldMetadata:
      | FlatFieldMetadata<FieldMetadataType.RELATION>
      | FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;
    // oxlint-disable-next-line typescript/no-explicit-any
    graphqlSelectedFields: Partial<Record<string, any>>;
    selectionKeys?: string[];
    accumulator: CommonSelectedFieldsResult;
    isFromOneToManyRelation?: boolean;
  }): void {
    const joinColumnName = computeMorphOrRelationFieldJoinColumnName({
      name: fieldMetadata.name,
    });

    if (isFieldSelected({ graphqlSelectedFields, fieldName: joinColumnName })) {
      accumulator.columns[joinColumnName] = true;
    }

    for (const selectionKey of selectionKeys) {
      this.graphqlQuerySelectedFieldsRelationParser.parseRelationField(
        fieldMetadata,
        selectionKey,
        graphqlSelectedFields[selectionKey],
        accumulator,
        isFromOneToManyRelation,
      );
    }
  }

  private parseConnectionField(
    // oxlint-disable-next-line typescript/no-explicit-any
    graphqlSelectedFields: Partial<Record<string, any>>,
    flatObjectMetadata: FlatObjectMetadata,
    accumulator: CommonSelectedFieldsResult,
    isFromOneToManyRelation?: boolean,
  ): void {
    this.aggregateParser.parse(
      graphqlSelectedFields,
      flatObjectMetadata,
      this.flatFieldMetadataMaps,
      accumulator,
    );

    this.parseRecordFields(
      graphqlSelectedFields.edges.node ?? {},
      flatObjectMetadata,
      accumulator,
      isFromOneToManyRelation,
    );
  }

  private isRootConnection(
    // oxlint-disable-next-line typescript/no-explicit-any
    graphqlSelectedFields: Partial<Record<string, any>>,
  ): boolean {
    return Object.keys(graphqlSelectedFields).includes('edges');
  }

  private parseCompositeField(
    fieldMetadata: OrmFlatFieldMetadata,
    fieldValue: Record<string, unknown>,
  ): Record<string, true> {
    const compositeType = compositeTypeDefinitions.get(
      fieldMetadata.type as CompositeFieldMetadataType,
    );

    if (!compositeType) {
      throw new Error(
        `Composite type definition not found for type: ${fieldMetadata.type}`,
      );
    }

    return Object.fromEntries(
      Object.keys(fieldValue)
        .filter((subFieldKey) => subFieldKey !== '__typename')
        .map((subFieldKey): [string, true] => {
          const subFieldMetadata = compositeType.properties.find(
            (property) => property.name === subFieldKey,
          );

          if (!subFieldMetadata) {
            throw new Error(
              `Sub field metadata not found for composite type: ${fieldMetadata.type}`,
            );
          }

          return [`${fieldMetadata.name}${capitalize(subFieldKey)}`, true];
        }),
    );
  }
}
