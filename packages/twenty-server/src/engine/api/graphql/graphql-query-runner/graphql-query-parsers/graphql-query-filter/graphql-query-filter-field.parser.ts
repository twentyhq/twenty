import { msg } from '@lingui/core/macro';
import {
  Brackets,
  type ObjectLiteral,
  type WhereExpressionBuilder,
} from 'typeorm';
import {
  compositeTypeDefinitions,
  FieldMetadataType,
  RelationType,
} from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';

import { MAX_RELATION_FILTER_DEPTH } from 'src/engine/api/common/common-args-processors/filter-arg-processor/constants/max-relation-filter-depth.constant';
import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { addRelationJoinAliasToQueryBuilder } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/utils/add-relation-join-alias.util';
import { resolveFilterKeyFieldMetadata } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/utils/resolve-filter-key-field-metadata.util';
import { assertArrayOperatorValueIsNonEmptyArray } from 'src/engine/api/graphql/graphql-query-runner/utils/assert-array-operator-value-is-non-empty-array.util';
import { computeWhereConditionParts } from 'src/engine/api/graphql/graphql-query-runner/utils/compute-where-condition-parts';
import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/composite-field-metadata-type.type';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';
import { renderRowLevelPermissionFilterToSql } from 'src/engine/twenty-orm/utils/render-row-level-permission-filter-to-sql.util';
import { resolveRowLevelPermissionRecordFilter } from 'src/engine/twenty-orm/utils/resolve-row-level-permission-record-filter.util';

import { GraphqlQueryFilterConditionParser } from './graphql-query-filter-condition.parser';

export class GraphqlQueryFilterFieldParser {
  private flatObjectMetadata: FlatObjectMetadata;
  private flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  private flatObjectMetadataMaps?: FlatEntityMaps<FlatObjectMetadata>;
  private fieldIdByName: Record<string, string>;
  private fieldIdByJoinColumnName: Record<string, string>;
  private depth: number;

  constructor(
    flatObjectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
    flatObjectMetadataMaps?: FlatEntityMaps<FlatObjectMetadata>,
    depth = 0,
  ) {
    this.flatObjectMetadata = flatObjectMetadata;
    this.flatFieldMetadataMaps = flatFieldMetadataMaps;
    this.flatObjectMetadataMaps = flatObjectMetadataMaps;
    this.depth = depth;

    const fieldMaps = buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      flatObjectMetadata,
    );

    this.fieldIdByName = fieldMaps.fieldIdByName;
    this.fieldIdByJoinColumnName = fieldMaps.fieldIdByJoinColumnName;
  }

  public parse(
    queryBuilder: WhereExpressionBuilder,
    outerQueryBuilder: WorkspaceSelectQueryBuilder<ObjectLiteral>,
    objectNameSingular: string,
    key: string,
    // oxlint-disable-next-line typescript/no-explicit-any
    filterValue: any,
    isFirst = false,
    useDirectTableReference = false,
  ): void {
    const { fieldMetadata, isReferencedByFieldName } =
      resolveFilterKeyFieldMetadata({
        filterKey: key,
        fieldIdByName: this.fieldIdByName,
        fieldIdByJoinColumnName: this.fieldIdByJoinColumnName,
        flatFieldMetadataMaps: this.flatFieldMetadataMaps,
      });

    if (!isDefined(fieldMetadata)) {
      throw new Error(`Field metadata not found for field: ${key}`);
    }

    const objectPermissions =
      outerQueryBuilder.objectRecordsPermissions[this.flatObjectMetadata.id];

    if (
      objectPermissions?.canReadObjectRecords === false ||
      objectPermissions?.restrictedFields[fieldMetadata.id]?.canRead === false
    ) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }

    if (
      isReferencedByFieldName &&
      isMorphOrRelationFlatFieldMetadata(fieldMetadata) &&
      (fieldMetadata.settings?.relationType === RelationType.MANY_TO_ONE ||
        (isFlatFieldMetadataOfType(fieldMetadata, FieldMetadataType.RELATION) &&
          fieldMetadata.settings?.relationType === RelationType.ONE_TO_MANY))
    ) {
      return this.parseRelationSubFilter(
        queryBuilder,
        outerQueryBuilder,
        objectNameSingular,
        fieldMetadata,
        filterValue,
        isFirst,
      );
    }

    if (isCompositeFieldMetadataType(fieldMetadata.type)) {
      return this.parseCompositeFieldForFilter(
        queryBuilder,
        fieldMetadata,
        objectNameSingular,
        filterValue,
        isFirst,
        useDirectTableReference,
      );
    }
    const [[operator, value]] = Object.entries(filterValue);

    assertArrayOperatorValueIsNonEmptyArray({ operator, value, key });

    const { sql, params } = computeWhereConditionParts({
      operator,
      objectNameSingular,
      key,
      value,
      fieldMetadataType: fieldMetadata.type,
      useDirectTableReference,
    });

    if (isFirst) {
      queryBuilder.where(sql, params);
    } else {
      queryBuilder.andWhere(sql, params);
    }
  }

  private parseRelationSubFilter(
    queryBuilder: WhereExpressionBuilder,
    outerQueryBuilder: WorkspaceSelectQueryBuilder<ObjectLiteral>,
    parentAlias: string,
    fieldMetadata: FlatFieldMetadata,
    filterValue: Partial<ObjectRecordFilter>,
    isFirst: boolean,
  ): void {
    if (this.depth >= MAX_RELATION_FILTER_DEPTH) {
      throw new GraphqlQueryRunnerException(
        `Relation filter nesting deeper than ${MAX_RELATION_FILTER_DEPTH} hop is not supported`,
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        {
          userFriendlyMessage: msg`Relation filters can only traverse one relation deep`,
        },
      );
    }

    if (!isDefined(this.flatObjectMetadataMaps)) {
      throw new GraphqlQueryRunnerException(
        `Relation filter on "${fieldMetadata.name}" requires object metadata maps`,
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: msg`Relation filter is not supported here` },
      );
    }

    if (!isDefined(fieldMetadata.relationTargetObjectMetadataId)) {
      throw new GraphqlQueryRunnerException(
        `Relation filter on "${fieldMetadata.name}" is missing a target object`,
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: msg`Relation filter is misconfigured` },
      );
    }

    const targetObjectMetadata =
      findFlatEntityByIdInFlatEntityMaps<FlatObjectMetadata>({
        flatEntityId: fieldMetadata.relationTargetObjectMetadataId,
        flatEntityMaps: this.flatObjectMetadataMaps,
      });

    if (!isDefined(targetObjectMetadata)) {
      throw new GraphqlQueryRunnerException(
        `Target object not found for relation "${fieldMetadata.name}"`,
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: msg`Relation filter is misconfigured` },
      );
    }

    if (
      isFlatFieldMetadataOfType(fieldMetadata, FieldMetadataType.RELATION) &&
      fieldMetadata.settings?.relationType === RelationType.ONE_TO_MANY
    ) {
      return this.parseOneToManyRelationSubFilter(
        queryBuilder,
        outerQueryBuilder,
        parentAlias,
        fieldMetadata,
        targetObjectMetadata,
        filterValue,
        isFirst,
      );
    }

    const joinAlias = fieldMetadata.name;

    addRelationJoinAliasToQueryBuilder({
      queryBuilder: outerQueryBuilder,
      parentAlias,
      relationName: joinAlias,
    });

    const childConditionParser = new GraphqlQueryFilterConditionParser(
      targetObjectMetadata,
      this.flatFieldMetadataMaps,
      this.flatObjectMetadataMaps,
      this.depth + 1,
    );

    const subBrackets = new Brackets((subQb) => {
      childConditionParser.applyFilterEntriesToWhereBrackets(
        subQb,
        outerQueryBuilder,
        joinAlias,
        filterValue,
      );
    });

    if (isFirst) {
      queryBuilder.where(subBrackets);
    } else {
      queryBuilder.andWhere(subBrackets);
    }
  }

  private parseOneToManyRelationSubFilter(
    queryBuilder: WhereExpressionBuilder,
    outerQueryBuilder: WorkspaceSelectQueryBuilder<ObjectLiteral>,
    parentAlias: string,
    fieldMetadata: FlatFieldMetadata<FieldMetadataType.RELATION>,
    targetObjectMetadata: FlatObjectMetadata,
    filterValue: Partial<ObjectRecordFilter>,
    isFirst: boolean,
  ): void {
    if (!isDefined(fieldMetadata.relationTargetFieldMetadataId)) {
      throw new GraphqlQueryRunnerException(
        `Relation filter on "${fieldMetadata.name}" is missing a target field`,
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: msg`Relation filter is misconfigured` },
      );
    }

    const targetRelationFieldMetadata =
      findFlatEntityByIdInFlatEntityMaps<FlatFieldMetadata>({
        flatEntityId: fieldMetadata.relationTargetFieldMetadataId,
        flatEntityMaps: this.flatFieldMetadataMaps,
      });

    if (
      !isDefined(targetRelationFieldMetadata) ||
      !isFlatFieldMetadataOfType(
        targetRelationFieldMetadata,
        FieldMetadataType.RELATION,
      ) ||
      targetRelationFieldMetadata.settings?.relationType !==
        RelationType.MANY_TO_ONE
    ) {
      throw new GraphqlQueryRunnerException(
        `Relation filter on "${fieldMetadata.name}" has an invalid target field`,
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: msg`Relation filter is misconfigured` },
      );
    }

    const parentEntityMetadata =
      outerQueryBuilder.expressionMap.findAliasByName(parentAlias).metadata;
    const typeormRelationMetadata =
      parentEntityMetadata.findRelationWithPropertyPath(fieldMetadata.name);

    if (!isDefined(typeormRelationMetadata)) {
      throw new GraphqlQueryRunnerException(
        `Relation metadata not found for "${parentAlias}.${fieldMetadata.name}"`,
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        { userFriendlyMessage: msg`Relation filter is misconfigured` },
      );
    }

    const targetAlias = `${parentAlias}_${fieldMetadata.name}_exists_${this.depth}`;
    const targetJoinColumnName = computeMorphOrRelationFieldJoinColumnName({
      name: targetRelationFieldMetadata.name,
    });
    const subQuery = outerQueryBuilder
      .subQuery()
      .select('1')
      .from(typeormRelationMetadata.inverseEntityMetadata.target, targetAlias);

    const childConditionParser = new GraphqlQueryFilterConditionParser(
      targetObjectMetadata,
      this.flatFieldMetadataMaps,
      this.flatObjectMetadataMaps,
      this.depth + 1,
    );

    childConditionParser.applyFilterEntriesToWhereBrackets(
      subQuery,
      outerQueryBuilder,
      targetAlias,
      filterValue,
    );

    subQuery.andWhere(
      `"${targetAlias}"."${targetJoinColumnName}" = "${parentAlias}"."id"`,
    );

    if (!outerQueryBuilder.shouldBypassPermissionChecks) {
      const rowLevelPermissionFilter = resolveRowLevelPermissionRecordFilter({
        internalContext: outerQueryBuilder.internalContext,
        authContext: outerQueryBuilder.authContext,
        objectMetadata: targetObjectMetadata,
      });

      if (isDefined(rowLevelPermissionFilter)) {
        const renderedPermissionFilter = renderRowLevelPermissionFilterToSql({
          recordFilter: rowLevelPermissionFilter,
          tableAlias: targetAlias,
          objectMetadata: targetObjectMetadata,
          flatFieldMetadataMaps:
            outerQueryBuilder.internalContext.flatFieldMetadataMaps,
        });

        if (isDefined(renderedPermissionFilter)) {
          subQuery.andWhere(
            renderedPermissionFilter.sql,
            renderedPermissionFilter.parameters,
          );
        }
      }
    }

    const existsCondition = `EXISTS ${subQuery.getQuery()}`;
    const parameters = subQuery.getParameters();

    if (isFirst) {
      queryBuilder.where(existsCondition, parameters);
    } else {
      queryBuilder.andWhere(existsCondition, parameters);
    }
  }

  private parseCompositeFieldForFilter(
    queryBuilder: WhereExpressionBuilder,
    fieldMetadata: FlatFieldMetadata,
    objectNameSingular: string,
    // oxlint-disable-next-line typescript/no-explicit-any
    fieldValue: any,
    isFirst = false,
    useDirectTableReference = false,
  ): void {
    const compositeType = compositeTypeDefinitions.get(
      fieldMetadata.type as CompositeFieldMetadataType,
    );

    if (!compositeType) {
      throw new Error(
        `Composite type definition not found for type: ${fieldMetadata.type}`,
      );
    }

    Object.entries(fieldValue).map(([subFieldKey, subFieldFilter], index) => {
      const subFieldMetadata = compositeType.properties.find(
        (property) => property.name === subFieldKey,
      );

      if (!subFieldMetadata) {
        throw new Error(
          `Sub field metadata not found for composite type: ${fieldMetadata.type}`,
        );
      }

      const fullFieldName = `${fieldMetadata.name}${capitalize(subFieldKey)}`;

      const [[operator, value]] = Object.entries(
        // oxlint-disable-next-line typescript/no-explicit-any
        subFieldFilter as Record<string, any>,
      );

      assertArrayOperatorValueIsNonEmptyArray({
        operator,
        value,
        key: subFieldKey,
      });

      const { sql, params } = computeWhereConditionParts({
        operator,
        objectNameSingular,
        key: fullFieldName,
        subFieldKey,
        value,
        fieldMetadataType: fieldMetadata.type,
        useDirectTableReference,
      });

      if (isFirst && index === 0) {
        queryBuilder.where(sql, params);
      }

      queryBuilder.andWhere(sql, params);
    });
  }
}
