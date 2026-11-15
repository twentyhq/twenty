import { RelationType, type FieldMetadataType } from 'twenty-shared/types';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { FilterArgProcessorService } from 'src/engine/api/common/common-args-processors/filter-arg-processor/filter-arg-processor.service';
import { DEFAULT_ID_ORDER_BY_TIEBREAKER } from 'src/engine/api/common/constants/default-id-order-by-tiebreaker.constant';
import { extractNestedRelationQueryArgs } from 'src/engine/api/common/common-nested-relations-processor/utils/extract-nested-relation-query-args.util';
import {
  GraphqlQuerySelectedFieldsParser,
  type GraphqlQuerySelectedFieldsResult,
} from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields.parser';
import { SELECTION_ARGUMENTS } from 'src/engine/api/graphql/workspace-resolver-builder/constants/selection-arguments.constant';
import { type ResolverSelectedFields } from 'src/engine/api/graphql/workspace-resolver-builder/types/resolver-selected-fields.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export class GraphqlQuerySelectedFieldsRelationParser {
  private flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  private flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  private readonly filterArgProcessor = new FilterArgProcessorService();

  constructor(
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>,
  ) {
    this.flatObjectMetadataMaps = flatObjectMetadataMaps;
    this.flatFieldMetadataMaps = flatFieldMetadataMaps;
  }

  parseRelationField({
    fieldMetadata,
    responseKey,
    fieldValue,
    accumulator,
    isFromOneToManyRelation,
  }: {
    fieldMetadata:
      | FlatFieldMetadata<FieldMetadataType.RELATION>
      | FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;
    responseKey: string;
    fieldValue: ResolverSelectedFields;
    accumulator: GraphqlQuerySelectedFieldsResult;
    isFromOneToManyRelation?: boolean;
  }): void {
    if (!fieldValue || typeof fieldValue !== 'object') {
      return;
    }

    const isOneToManyRelation =
      fieldMetadata.settings?.relationType === RelationType.ONE_TO_MANY;

    if (isFromOneToManyRelation && isOneToManyRelation) {
      accumulator.hasAtLeastTwoNestedOneToManyRelations = true;
    }

    if (!isDefined(fieldMetadata.relationTargetObjectMetadataId)) {
      throw new Error(
        `Relation target object metadata id not found for field ${fieldMetadata.name}`,
      );
    }

    const targetObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: fieldMetadata.relationTargetObjectMetadataId,
      flatEntityMaps: this.flatObjectMetadataMaps,
    });

    const fieldParser = new GraphqlQuerySelectedFieldsParser(
      this.flatObjectMetadataMaps,
      this.flatFieldMetadataMaps,
    );
    const relationAccumulator = fieldParser.parse(
      fieldValue,
      targetObjectMetadata,
      isFromOneToManyRelation || isOneToManyRelation,
    );

    accumulator.select[responseKey] = {
      id: true,
      ...relationAccumulator.select,
    };
    accumulator.aggregate[responseKey] = relationAccumulator.aggregate;
    accumulator.relationFieldsCount =
      accumulator.relationFieldsCount +
      relationAccumulator.relationFieldsCount +
      1;
    accumulator.hasAtLeastTwoNestedOneToManyRelations =
      accumulator.hasAtLeastTwoNestedOneToManyRelations ||
      relationAccumulator.hasAtLeastTwoNestedOneToManyRelations;

    const graphqlArguments = fieldValue[SELECTION_ARGUMENTS];

    accumulator.relationSelections[responseKey] = {
      fieldName: fieldMetadata.name,
      ...(isOneToManyRelation && isPlainObject(graphqlArguments)
        ? this.resolveQueryArgs(graphqlArguments, targetObjectMetadata)
        : {}),
      relationSelections: relationAccumulator.relationSelections,
    };
  }

  // Resolved while parsing so a malformed argument fails before a mutation writes anything
  private resolveQueryArgs(
    graphqlArguments: Record<string, unknown>,
    targetObjectMetadata: FlatObjectMetadata,
  ) {
    const { filter, orderBy, first } =
      extractNestedRelationQueryArgs(graphqlArguments);

    return {
      filter: this.filterArgProcessor.process({
        filter,
        flatObjectMetadata: targetObjectMetadata,
        flatObjectMetadataMaps: this.flatObjectMetadataMaps,
        flatFieldMetadataMaps: this.flatFieldMetadataMaps,
      }),
      // first pages a LIMIT per parent, which needs an order to be deterministic
      orderBy:
        isDefined(orderBy) || isDefined(first)
          ? [...(orderBy ?? []), DEFAULT_ID_ORDER_BY_TIEBREAKER]
          : undefined,
      first,
    };
  }
}
