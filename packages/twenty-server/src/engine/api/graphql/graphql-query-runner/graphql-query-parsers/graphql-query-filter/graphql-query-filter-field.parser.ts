import { msg } from '@lingui/core/macro';
import { Brackets, type WhereExpressionBuilder } from 'typeorm';
import { FIELD_REFERENCE_FILTER_OPERATORS } from 'twenty-shared/constants';
import {
  compositeTypeDefinitions,
  type FieldReferenceFilterOperator,
  RelationType,
} from 'twenty-shared/types';
import {
  capitalize,
  isDefined,
  isFieldReferenceFilterOperator,
  parseFieldReferenceFilterValue,
} from 'twenty-shared/utils';

import { MAX_RELATION_FILTER_DEPTH } from 'src/engine/api/common/common-args-processors/filter-arg-processor/constants/max-relation-filter-depth.constant';
import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { addRelationJoinAliasToQueryBuilder } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/utils/add-relation-join-alias.util';
import { resolveObjectSharing } from 'src/engine/core-modules/record-share/utils/resolve-object-sharing.util';
import { assertFieldIsReadableOrThrow } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/utils/assert-field-is-readable-or-throw.util';
import { resolveFilterKeyFieldMetadata } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/utils/resolve-filter-key-field-metadata.util';
import { assertArrayOperatorValueIsNonEmptyArray } from 'src/engine/api/graphql/graphql-query-runner/utils/assert-array-operator-value-is-non-empty-array.util';
import { computeWhereConditionParts } from 'src/engine/api/graphql/graphql-query-runner/utils/compute-where-condition-parts';
import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/composite-field-metadata-type.type';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { findFlatFieldMetadataByName } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-flat-field-metadata-by-name.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';

import { GraphqlQueryFilterConditionParser } from './graphql-query-filter-condition.parser';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/query-builder/workspace-select-query-builder';

export type ParentFilterScope = {
  flatObjectMetadata: FlatObjectMetadata;
  alias: string;
  relationFieldMetadataId: string;
};

const SQL_COMPARISON_OPERATORS = {
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
} as const;

export class GraphqlQueryFilterFieldParser {
  private flatObjectMetadata: FlatObjectMetadata;
  private flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  private flatObjectMetadataMaps?: FlatEntityMaps<FlatObjectMetadata>;
  private fieldIdByName: Record<string, string>;
  private fieldIdByJoinColumnName: Record<string, string>;
  private depth: number;
  private parentFilterScope?: ParentFilterScope;

  constructor(
    flatObjectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>,
    flatObjectMetadataMaps?: FlatEntityMaps<FlatObjectMetadata>,
    depth = 0,
    parentFilterScope?: ParentFilterScope,
  ) {
    this.flatObjectMetadata = flatObjectMetadata;
    this.flatFieldMetadataMaps = flatFieldMetadataMaps;
    this.flatObjectMetadataMaps = flatObjectMetadataMaps;
    this.depth = depth;
    this.parentFilterScope = parentFilterScope;

    const fieldMaps = buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      flatObjectMetadata,
    );

    this.fieldIdByName = fieldMaps.fieldIdByName;
    this.fieldIdByJoinColumnName = fieldMaps.fieldIdByJoinColumnName;
  }

  public parse(
    queryBuilder: WhereExpressionBuilder,
    outerQueryBuilder: WorkspaceSelectQueryBuilder,
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

    // Filtering the queried object itself stays possible on records shared by
    // name, while a filter through a relation still needs the object readable
    if (
      objectPermissions?.canReadObjectRecords === false &&
      !(
        this.depth === 0 &&
        resolveObjectSharing({
          flatObjectMetadata: this.flatObjectMetadata,
          featureFlagsMap: outerQueryBuilder.featureFlagsMap,
        }).operationTypesGrantedBeyondRole.includes('select')
      )
    ) {
      throw new PermissionsException(
        PermissionsExceptionMessage.PERMISSION_DENIED,
        PermissionsExceptionCode.PERMISSION_DENIED,
      );
    }

    assertFieldIsReadableOrThrow({
      objectsPermissions: outerQueryBuilder.objectRecordsPermissions,
      objectMetadataId: this.flatObjectMetadata.id,
      fieldMetadataId: fieldMetadata.id,
    });

    if (
      isReferencedByFieldName &&
      isMorphOrRelationFlatFieldMetadata(fieldMetadata) &&
      (fieldMetadata.settings?.relationType === RelationType.MANY_TO_ONE ||
        fieldMetadata.settings?.relationType === RelationType.ONE_TO_MANY)
    ) {
      return this.parseRelationSubFilter({
        queryBuilder,
        outerQueryBuilder,
        parentAlias: objectNameSingular,
        fieldMetadata,
        filterValue,
        isFirst,
        isToManyRelation:
          fieldMetadata.settings.relationType === RelationType.ONE_TO_MANY,
      });
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

    if (isFieldReferenceFilterOperator(operator)) {
      const sql = this.computeFieldReferenceCondition({
        outerQueryBuilder,
        objectNameSingular,
        key,
        operator,
        fieldReferenceValue: value,
        useDirectTableReference,
      });

      if (isFirst) {
        queryBuilder.where(sql);
      } else {
        queryBuilder.andWhere(sql);
      }

      return;
    }

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

  private parseRelationSubFilter({
    queryBuilder,
    outerQueryBuilder,
    parentAlias,
    fieldMetadata,
    filterValue,
    isFirst,
    isToManyRelation,
  }: {
    queryBuilder: WhereExpressionBuilder;
    outerQueryBuilder: WorkspaceSelectQueryBuilder;
    parentAlias: string;
    fieldMetadata: OrmFlatFieldMetadata;
    filterValue: Partial<ObjectRecordFilter>;
    isFirst: boolean;
    isToManyRelation: boolean;
  }): void {
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

    const childConditionParser = new GraphqlQueryFilterConditionParser(
      targetObjectMetadata,
      this.flatFieldMetadataMaps,
      this.flatObjectMetadataMaps,
      this.depth + 1,
      {
        flatObjectMetadata: this.flatObjectMetadata,
        alias: parentAlias,
        relationFieldMetadataId: fieldMetadata.id,
      },
    );

    // A to-many join would duplicate root rows, which the find-many runner rejects, so match through a correlated EXISTS
    if (isToManyRelation) {
      // The EXISTS is correlated with the root alias, so through a joined to-one it would match the wrong rows
      if (parentAlias !== outerQueryBuilder.alias) {
        throw new GraphqlQueryRunnerException(
          `To-many relation filter on "${fieldMetadata.name}" must apply to the root object`,
          GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
          {
            userFriendlyMessage: msg`Relation filters can only traverse one relation deep`,
          },
        );
      }

      const existsToken = outerQueryBuilder.addRelationExistsFilter({
        relationFieldName: fieldMetadata.name,
        applyWhere: (nestedQueryBuilder) => {
          nestedQueryBuilder.where(
            new Brackets((subQb) => {
              childConditionParser.applyFilterEntriesToWhereBrackets(
                subQb,
                nestedQueryBuilder,
                nestedQueryBuilder.alias,
                filterValue,
              );
            }),
          );
        },
      });

      if (isFirst) {
        queryBuilder.where(existsToken);
      } else {
        queryBuilder.andWhere(existsToken);
      }

      return;
    }

    const joinAlias = fieldMetadata.name;

    addRelationJoinAliasToQueryBuilder({
      queryBuilder: outerQueryBuilder,
      parentAlias,
      relationName: joinAlias,
    });

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

  // Column names come from metadata, so the filter value never reaches the SQL
  private computeFieldReferenceCondition({
    outerQueryBuilder,
    objectNameSingular,
    key,
    operator,
    fieldReferenceValue,
    useDirectTableReference,
  }: {
    outerQueryBuilder: WorkspaceSelectQueryBuilder;
    objectNameSingular: string;
    key: string;
    operator: FieldReferenceFilterOperator;
    fieldReferenceValue: unknown;
    useDirectTableReference: boolean;
  }): string {
    const fieldReference = parseFieldReferenceFilterValue(fieldReferenceValue);
    const referencedScope = isDefined(fieldReference?.relationFieldName)
      ? this.findParentFilterScopeOrThrow({
          operator,
          relationFieldName: fieldReference.relationFieldName,
          useDirectTableReference,
        })
      : {
          flatObjectMetadata: this.flatObjectMetadata,
          alias: objectNameSingular,
        };

    const referencedFieldMetadata = isDefined(fieldReference)
      ? findFlatFieldMetadataByName({
          fieldName: fieldReference.fieldName,
          flatObjectMetadata: referencedScope.flatObjectMetadata,
          flatFieldMetadataMaps: this.flatFieldMetadataMaps,
        })
      : undefined;

    if (!isDefined(referencedFieldMetadata)) {
      throw new GraphqlQueryRunnerException(
        `Field "${String(fieldReferenceValue)}" to compare "${key}" with was not found`,
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        {
          userFriendlyMessage: msg`Invalid filter: the field to compare with was not found`,
        },
      );
    }

    assertFieldIsReadableOrThrow({
      objectsPermissions: outerQueryBuilder.objectRecordsPermissions,
      objectMetadataId: referencedScope.flatObjectMetadata.id,
      fieldMetadataId: referencedFieldMetadata.id,
    });

    const fieldColumnReference = useDirectTableReference
      ? `"${key}"`
      : `"${objectNameSingular}"."${key}"`;
    const referencedColumnReference = useDirectTableReference
      ? `"${referencedFieldMetadata.name}"`
      : `"${referencedScope.alias}"."${referencedFieldMetadata.name}"`;

    return `${fieldColumnReference} ${SQL_COMPARISON_OPERATORS[FIELD_REFERENCE_FILTER_OPERATORS[operator]]} ${referencedColumnReference}`;
  }

  // Only the parent is supported: its row is already in scope, with no extra join
  private findParentFilterScopeOrThrow({
    operator,
    relationFieldName,
    useDirectTableReference,
  }: {
    operator: FieldReferenceFilterOperator;
    relationFieldName: string;
    useDirectTableReference: boolean;
  }): ParentFilterScope {
    const relationFieldMetadata = findFlatFieldMetadataByName({
      fieldName: relationFieldName,
      flatObjectMetadata: this.flatObjectMetadata,
      flatFieldMetadataMaps: this.flatFieldMetadataMaps,
    });

    if (
      !isDefined(this.parentFilterScope) ||
      useDirectTableReference ||
      relationFieldMetadata?.relationTargetFieldMetadataId !==
        this.parentFilterScope.relationFieldMetadataId
    ) {
      throw new GraphqlQueryRunnerException(
        `Operator "${operator}" can only reference "${relationFieldName}" when it leads back to the record the relation filter starts from`,
        GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
        {
          userFriendlyMessage: msg`Invalid filter: "${relationFieldName}" can only reference the record the relation filter starts from`,
        },
      );
    }

    return this.parentFilterScope;
  }

  private parseCompositeFieldForFilter(
    queryBuilder: WhereExpressionBuilder,
    fieldMetadata: OrmFlatFieldMetadata,
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
