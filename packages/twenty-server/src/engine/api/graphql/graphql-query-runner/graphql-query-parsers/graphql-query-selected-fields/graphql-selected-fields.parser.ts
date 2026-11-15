import {
  FieldMetadataType,
  compositeTypeDefinitions,
} from 'twenty-shared/types';
import {
  capitalize,
  isDefined,
  isMorphRelationHead,
} from 'twenty-shared/utils';

import {
  CommonQueryRunnerException,
  CommonQueryRunnerExceptionCode,
} from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';
import { type CommonRelationSelections } from 'src/engine/api/common/types/common-relation-selection.type';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { GraphqlQuerySelectedFieldsAggregateParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields-aggregate.parser';
import { GraphqlQuerySelectedFieldsRelationParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields-relation.parser';
import { getFieldSelections } from 'src/engine/api/graphql/workspace-resolver-builder/utils/get-field-selections.util';
import { getSelectionEntries } from 'src/engine/api/graphql/workspace-resolver-builder/utils/get-selection-entries.util';
import { mergeFieldSelections } from 'src/engine/api/graphql/workspace-resolver-builder/utils/merge-field-selections.util';
import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/composite-field-metadata-type.type';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { STANDARD_ERROR_MESSAGE } from 'src/engine/constants/standard-error-message.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type GraphqlQuerySelectedFieldsResult = {
  // oxlint-disable-next-line typescript/no-explicit-any
  select: Record<string, any>;
  // oxlint-disable-next-line typescript/no-explicit-any
  aggregate: Record<string, any>;
  relationFieldsCount: number;
  hasAtLeastTwoNestedOneToManyRelations: boolean;
  relationSelections: CommonRelationSelections;
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
  ): GraphqlQuerySelectedFieldsResult {
    const accumulator: GraphqlQuerySelectedFieldsResult = {
      select: {},
      aggregate: {},
      relationFieldsCount: 0,
      hasAtLeastTwoNestedOneToManyRelations: false,
      relationSelections: {},
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
    accumulator: GraphqlQuerySelectedFieldsResult,
    isFromOneToManyRelation?: boolean,
  ): void {
    for (const fieldMetadataId of flatObjectMetadata.fieldIds) {
      const fieldMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: fieldMetadataId,
        flatEntityMaps: this.flatFieldMetadataMaps,
      });

      if (
        isFlatFieldMetadataOfType(fieldMetadata, FieldMetadataType.RELATION)
      ) {
        this.parseRelationFieldSelections({
          fieldMetadata,
          graphqlSelectedFields,
          flatObjectMetadata,
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

        this.parseRelationFieldSelections({
          fieldMetadata,
          graphqlSelectedFields,
          flatObjectMetadata,
          accumulator,
          isFromOneToManyRelation,
        });

        continue;
      }

      const fieldSelections = getFieldSelections({
        selectedFields: graphqlSelectedFields,
        fieldName: fieldMetadata.name,
      });

      if (fieldSelections.length === 0) {
        continue;
      }

      if (isCompositeFieldMetadataType(fieldMetadata.type)) {
        const compositeResult = this.parseCompositeField(
          fieldMetadata,
          mergeFieldSelections({
            selectedFields: graphqlSelectedFields,
            fieldName: fieldMetadata.name,
          }),
        );

        Object.assign(accumulator.select, compositeResult);

        continue;
      }

      accumulator.select[fieldMetadata.name] = true;
    }
  }

  private parseRelationFieldSelections({
    fieldMetadata,
    graphqlSelectedFields,
    flatObjectMetadata,
    accumulator,
    isFromOneToManyRelation,
  }: {
    fieldMetadata:
      | FlatFieldMetadata<FieldMetadataType.RELATION>
      | FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;
    // oxlint-disable-next-line typescript/no-explicit-any
    graphqlSelectedFields: Partial<Record<string, any>>;
    flatObjectMetadata: FlatObjectMetadata;
    accumulator: GraphqlQuerySelectedFieldsResult;
    isFromOneToManyRelation?: boolean;
  }): void {
    const joinColumnName = computeMorphOrRelationFieldJoinColumnName({
      name: fieldMetadata.name,
    });

    if (
      getFieldSelections({
        selectedFields: graphqlSelectedFields,
        fieldName: joinColumnName,
      }).length > 0
    ) {
      accumulator.select[joinColumnName] = true;
    }

    for (const { responseKey, selection } of getFieldSelections({
      selectedFields: graphqlSelectedFields,
      fieldName: fieldMetadata.name,
    })) {
      this.assertRelationResponseKeyIsFree({
        responseKey,
        fieldName: fieldMetadata.name,
        flatObjectMetadata,
        accumulator,
      });

      this.graphqlQuerySelectedFieldsRelationParser.parseRelationField({
        fieldMetadata,
        responseKey,
        fieldValue: selection,
        accumulator,
        isFromOneToManyRelation,
      });
    }
  }

  // A relation's rows sit on the record under its response key, next to the object's own columns
  private assertRelationResponseKeyIsFree({
    responseKey,
    fieldName,
    flatObjectMetadata,
    accumulator,
  }: {
    responseKey: string;
    fieldName: string;
    flatObjectMetadata: FlatObjectMetadata;
    accumulator: GraphqlQuerySelectedFieldsResult;
  }): void {
    const { fieldIdByName, fieldIdByJoinColumnName } =
      buildFieldMapsFromFlatObjectMetadata(
        this.flatFieldMetadataMaps,
        flatObjectMetadata,
      );

    const isTakenByAnotherRelation = isDefined(
      accumulator.relationSelections[responseKey],
    );
    const isTakenByAColumn =
      responseKey !== fieldName &&
      (isDefined(fieldIdByName[responseKey]) ||
        isDefined(fieldIdByJoinColumnName[responseKey]));

    if (isTakenByAnotherRelation || isTakenByAColumn) {
      throw new CommonQueryRunnerException(
        `Response key "${responseKey}" of relation "${fieldName}" is already used on ${flatObjectMetadata.nameSingular}`,
        CommonQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }
  }

  private parseConnectionField(
    // oxlint-disable-next-line typescript/no-explicit-any
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

    const node = mergeFieldSelections({
      selectedFields: mergeFieldSelections({
        selectedFields: graphqlSelectedFields,
        fieldName: 'edges',
      }),
      fieldName: 'node',
    });

    this.parseRecordFields(
      node,
      flatObjectMetadata,
      accumulator,
      isFromOneToManyRelation,
    );
  }

  private isRootConnection(
    // oxlint-disable-next-line typescript/no-explicit-any
    graphqlSelectedFields: Partial<Record<string, any>>,
  ): boolean {
    return (
      getFieldSelections({
        selectedFields: graphqlSelectedFields,
        fieldName: 'edges',
      }).length > 0
    );
  }

  private parseCompositeField(
    fieldMetadata: OrmFlatFieldMetadata,
    fieldValue: Record<string, unknown>,
    // oxlint-disable-next-line typescript/no-explicit-any
  ): Record<string, any> {
    const compositeType = compositeTypeDefinitions.get(
      fieldMetadata.type as CompositeFieldMetadataType,
    );

    if (!compositeType) {
      throw new Error(
        `Composite type definition not found for type: ${fieldMetadata.type}`,
      );
    }

    return getSelectionEntries(fieldValue)
      .filter(({ fieldName: subFieldName }) => subFieldName !== '__typename')
      .reduce(
        (acc, { fieldName: subFieldName }) => {
          const subFieldMetadata = compositeType.properties.find(
            (property) => property.name === subFieldName,
          );

          if (!subFieldMetadata) {
            throw new Error(
              `Sub field metadata not found for composite type: ${fieldMetadata.type}`,
            );
          }

          const fullFieldName = `${fieldMetadata.name}${capitalize(subFieldName)}`;

          acc[fullFieldName] = true;

          return acc;
        },
        // oxlint-disable-next-line typescript/no-explicit-any
        {} as Record<string, any>,
      );
  }
}
