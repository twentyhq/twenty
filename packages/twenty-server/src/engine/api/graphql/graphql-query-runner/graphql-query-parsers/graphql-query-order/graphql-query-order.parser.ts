import { isObject } from 'class-validator';
import { compositeTypeDefinitions } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';

import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import {
  buildOrderByColumnExpression,
  shouldCastToText,
  shouldUseCaseInsensitiveOrder,
} from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/build-order-by-column-expression.util';
import { convertOrderByToFindOptionsOrder } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/convert-order-by-to-find-options-order';
import { isOrderByDirection } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/is-order-by-direction.util';
import { parseCompositeFieldForOrder } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/parse-composite-field-for-order.util';
import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/composite-field-metadata-type.type';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

import { type OrderByClause } from './types/order-by-condition.type';
import { type ParseOrderByResult } from './types/parse-order-by-result.type';
import { type RelationJoinInfo } from './types/relation-join-info.type';

// Re-export types for backward compatibility
export { OrderByClause, ParseOrderByResult, RelationJoinInfo };

export class GraphqlQueryOrderFieldParser {
  private flatObjectMetadata: FlatObjectMetadata;
  private flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  private flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  private fieldIdByName: Record<string, string>;
  private fieldIdByJoinColumnName: Record<string, string>;
  private workspaceSchemaName: string | undefined;

  constructor(
    flatObjectMetadata: FlatObjectMetadata,
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
    workspaceId?: string,
  ) {
    this.flatObjectMetadata = flatObjectMetadata;
    this.flatObjectMetadataMaps = flatObjectMetadataMaps;
    this.flatFieldMetadataMaps = flatFieldMetadataMaps;
    this.workspaceSchemaName = workspaceId
      ? getWorkspaceSchemaName(workspaceId)
      : undefined;

    const fieldMaps = buildFieldMapsFromFlatObjectMetadata(
      flatFieldMetadataMaps,
      flatObjectMetadata,
    );

    this.fieldIdByName = fieldMaps.fieldIdByName;
    this.fieldIdByJoinColumnName = fieldMaps.fieldIdByJoinColumnName;
  }

  parse(
    orderBy: ObjectRecordOrderBy,
    objectNameSingular: string,
    isForwardPagination = true,
  ): ParseOrderByResult {
    const orderByConditions: Record<string, OrderByClause> = {};
    // Keep relationJoins for backward compatibility, but we won't use it for ordering
    const relationJoins: RelationJoinInfo[] = [];

    for (const item of orderBy) {
      for (const [fieldName, orderByDirection] of Object.entries(item)) {
        // Check if accessed by relation name (company) vs FK name (companyId)
        const isAccessedByRelationName = !!this.fieldIdByName[fieldName];
        const fieldMetadataId =
          this.fieldIdByName[fieldName] ||
          this.fieldIdByJoinColumnName[fieldName];
        const fieldMetadata = this.flatFieldMetadataMaps.byId[fieldMetadataId];

        if (!fieldMetadata || orderByDirection === undefined) {
          throw new GraphqlQueryRunnerException(
            `Field "${fieldName}" does not exist or is not sortable`,
            GraphqlQueryRunnerExceptionCode.FIELD_NOT_FOUND,
            { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
          );
        }

        // Only treat as relation if accessed by relation name (not FK like companyId)
        if (
          isAccessedByRelationName &&
          isMorphOrRelationFlatFieldMetadata(fieldMetadata)
        ) {
          if (!isObject(orderByDirection)) {
            throw new GraphqlQueryRunnerException(
              `Relation field "${fieldName}" requires nested field ordering (e.g., { ${fieldName}: { fieldName: 'AscNullsFirst' } })`,
              GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
              { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
            );
          }

          // Use subquery approach instead of JOINs to avoid TypeORM DISTINCT issues
          const relationOrderResult = this.parseRelationFieldOrderWithSubquery({
            fieldMetadata,
            orderByDirection: orderByDirection as Record<string, unknown>,
            objectNameSingular,
            isForwardPagination,
          });

          if (relationOrderResult) {
            Object.assign(orderByConditions, relationOrderResult);
          }
        } else if (isCompositeFieldMetadataType(fieldMetadata.type)) {
          if (!isObject(orderByDirection)) {
            throw new GraphqlQueryRunnerException(
              `Composite field "${fieldName}" requires subfield ordering (e.g., { ${fieldName}: { subFieldName: 'AscNullsFirst' } })`,
              GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
              { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
            );
          }

          const compositeOrder = parseCompositeFieldForOrder(
            fieldMetadata,
            orderByDirection as Record<string, unknown>,
            objectNameSingular,
            isForwardPagination,
          );

          Object.assign(orderByConditions, compositeOrder);
        } else {
          if (!isOrderByDirection(orderByDirection)) {
            throw new GraphqlQueryRunnerException(
              `Scalar field "${fieldName}" requires a direction value (AscNullsFirst, AscNullsLast, DescNullsFirst, DescNullsLast)`,
              GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
              { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
            );
          }

          const columnExpression = buildOrderByColumnExpression(
            objectNameSingular,
            fieldName,
          );

          orderByConditions[columnExpression] = {
            ...convertOrderByToFindOptionsOrder(
              orderByDirection,
              isForwardPagination,
            ),
            useLower: shouldUseCaseInsensitiveOrder(fieldMetadata.type),
            castToText: shouldCastToText(fieldMetadata.type),
          };
        }
      }
    }

    return {
      orderBy: orderByConditions,
      relationJoins, // Empty - we use subqueries instead of JOINs for ordering
    };
  }

  // Uses scalar subqueries for relation ordering to avoid TypeORM DISTINCT issues
  // Instead of: LEFT JOIN company ON ... ORDER BY company.name
  // We use: ORDER BY (SELECT name FROM company WHERE id = person.companyId)
  private parseRelationFieldOrderWithSubquery({
    fieldMetadata,
    orderByDirection,
    objectNameSingular,
    isForwardPagination,
  }: {
    fieldMetadata: FlatFieldMetadata;
    orderByDirection: Record<string, unknown>;
    objectNameSingular: string;
    isForwardPagination: boolean;
  }): Record<string, OrderByClause> | null {
    if (!isDefined(fieldMetadata.relationTargetObjectMetadataId)) {
      return null;
    }

    const targetObjectMetadata =
      this.flatObjectMetadataMaps.byId[
        fieldMetadata.relationTargetObjectMetadataId
      ];

    if (!isDefined(targetObjectMetadata)) {
      return null;
    }

    // Get the join column name (e.g., "companyId" for person.company relation)
    // Type assertion needed because settings type varies by field type
    const settings = fieldMetadata.settings as
      | { joinColumnName?: string; relationType?: RelationType }
      | undefined;
    const joinColumnName = settings?.joinColumnName;

    if (
      !isDefined(joinColumnName) ||
      settings?.relationType !== RelationType.MANY_TO_ONE
    ) {
      // Only MANY_TO_ONE relations have join columns on this side
      return null;
    }

    const nestedFieldName = Object.keys(orderByDirection)[0];
    const nestedFieldOrderByValue = orderByDirection[nestedFieldName];

    if (!isDefined(nestedFieldOrderByValue)) {
      return null;
    }

    const { fieldIdByName: targetFieldIdByName } =
      buildFieldMapsFromFlatObjectMetadata(
        this.flatFieldMetadataMaps,
        targetObjectMetadata,
      );

    const nestedFieldMetadataId = targetFieldIdByName[nestedFieldName];

    if (!isDefined(nestedFieldMetadataId)) {
      throw new GraphqlQueryRunnerException(
        `Nested field "${nestedFieldName}" not found in target object "${targetObjectMetadata.nameSingular}"`,
        GraphqlQueryRunnerExceptionCode.FIELD_NOT_FOUND,
        { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
      );
    }

    const nestedFieldMetadata =
      this.flatFieldMetadataMaps.byId[nestedFieldMetadataId];

    if (!isDefined(nestedFieldMetadata)) {
      return null;
    }

    // Build schema-qualified table name for the subquery's FROM clause
    const targetTableName = this.workspaceSchemaName
      ? `"${this.workspaceSchemaName}"."${targetObjectMetadata.nameSingular}"`
      : `"${targetObjectMetadata.nameSingular}"`;

    // For correlated subquery, reference the main table by its alias (not schema-qualified)
    // PostgreSQL requires this for correlated subqueries
    const sourceTableAlias = `"${objectNameSingular}"`;

    if (isCompositeFieldMetadataType(nestedFieldMetadata.type)) {
      if (!isObject(nestedFieldOrderByValue)) {
        throw new GraphqlQueryRunnerException(
          `Composite field "${nestedFieldMetadata.name}" requires a subfield to be specified`,
          GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
          { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
        );
      }

      return this.buildCompositeSubqueryOrder({
        nestedFieldMetadata,
        nestedFieldOrderByValue: nestedFieldOrderByValue as Record<
          string,
          unknown
        >,
        targetTableName,
        sourceTableAlias,
        joinColumnName,
        isForwardPagination,
      });
    }

    if (isOrderByDirection(nestedFieldOrderByValue)) {
      // Build correlated subquery
      // targetTableName is schema-qualified (e.g., "schema"."table" or "table")
      // sourceTableAlias references the main query's table alias (not schema-qualified)
      const subquery = `(SELECT "${nestedFieldMetadata.name}" FROM ${targetTableName} WHERE "id" = ${sourceTableAlias}."${joinColumnName}")`;

      return {
        [subquery]: {
          ...convertOrderByToFindOptionsOrder(
            nestedFieldOrderByValue,
            isForwardPagination,
          ),
          useLower: shouldUseCaseInsensitiveOrder(nestedFieldMetadata.type),
          castToText: shouldCastToText(nestedFieldMetadata.type),
        },
      };
    }

    return null;
  }

  private buildCompositeSubqueryOrder({
    nestedFieldMetadata,
    nestedFieldOrderByValue,
    targetTableName,
    sourceTableAlias,
    joinColumnName,
    isForwardPagination,
  }: {
    nestedFieldMetadata: FlatFieldMetadata;
    nestedFieldOrderByValue: Record<string, unknown>;
    targetTableName: string;
    sourceTableAlias: string;
    joinColumnName: string;
    isForwardPagination: boolean;
  }): Record<string, OrderByClause> | null {
    const compositeType = compositeTypeDefinitions.get(
      nestedFieldMetadata.type as CompositeFieldMetadataType,
    );

    if (!compositeType) {
      return null;
    }

    const result: Record<string, OrderByClause> = {};

    for (const [subFieldKey, subFieldValue] of Object.entries(
      nestedFieldOrderByValue,
    )) {
      const subFieldMetadata = compositeType.properties.find(
        (property) => property.name === subFieldKey,
      );

      if (!subFieldMetadata) {
        throw new GraphqlQueryRunnerException(
          `Sub field "${subFieldKey}" not found in composite type`,
          GraphqlQueryRunnerExceptionCode.FIELD_NOT_FOUND,
          { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
        );
      }

      if (!isOrderByDirection(subFieldValue)) {
        throw new GraphqlQueryRunnerException(
          `Sub field order by value must be of type OrderByDirection`,
          GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
          { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
        );
      }

      const columnName = `${nestedFieldMetadata.name}${capitalize(subFieldKey)}`;
      // targetTableName is schema-qualified, sourceTableAlias references the main query's table
      const subquery = `(SELECT "${columnName}" FROM ${targetTableName} WHERE "id" = ${sourceTableAlias}."${joinColumnName}")`;

      result[subquery] = {
        ...convertOrderByToFindOptionsOrder(subFieldValue, isForwardPagination),
        useLower: shouldUseCaseInsensitiveOrder(subFieldMetadata.type),
        castToText: shouldCastToText(subFieldMetadata.type),
      };
    }

    return Object.keys(result).length > 0 ? result : null;
  }
}
