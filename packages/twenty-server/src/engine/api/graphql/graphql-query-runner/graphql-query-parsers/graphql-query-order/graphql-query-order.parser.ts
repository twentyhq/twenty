import { isObject } from 'class-validator';
import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

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
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

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

  constructor(
    flatObjectMetadata: FlatObjectMetadata,
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ) {
    this.flatObjectMetadata = flatObjectMetadata;
    this.flatObjectMetadataMaps = flatObjectMetadataMaps;
    this.flatFieldMetadataMaps = flatFieldMetadataMaps;

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
    const relationJoins: RelationJoinInfo[] = [];
    const addedJoinAliases = new Set<string>();

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

          const relationOrderResult = this.parseRelationFieldOrder({
            fieldMetadata,
            orderByDirection: orderByDirection as Record<string, unknown>,
            isForwardPagination,
          });

          if (relationOrderResult) {
            Object.assign(orderByConditions, relationOrderResult.orderBy);

            if (!addedJoinAliases.has(relationOrderResult.joinInfo.joinAlias)) {
              relationJoins.push(relationOrderResult.joinInfo);
              addedJoinAliases.add(relationOrderResult.joinInfo.joinAlias);
            }
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
      relationJoins,
    };
  }

  private parseRelationFieldOrder({
    fieldMetadata,
    orderByDirection,
    isForwardPagination,
  }: {
    fieldMetadata: FlatFieldMetadata;
    orderByDirection: Record<string, unknown>;
    isForwardPagination: boolean;
  }): {
    orderBy: Record<string, OrderByClause>;
    joinInfo: RelationJoinInfo;
  } | null {
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

    const joinAlias = fieldMetadata.name;

    const joinInfo: RelationJoinInfo = {
      joinAlias,
    };

    if (isCompositeFieldMetadataType(nestedFieldMetadata.type)) {
      if (!isObject(nestedFieldOrderByValue)) {
        throw new GraphqlQueryRunnerException(
          `Composite field "${nestedFieldMetadata.name}" requires a subfield to be specified`,
          GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
          { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
        );
      }

      const compositeOrder = parseCompositeFieldForOrder(
        nestedFieldMetadata,
        nestedFieldOrderByValue as Record<string, unknown>,
        joinAlias,
        isForwardPagination,
      );

      if (Object.keys(compositeOrder).length === 0) {
        return null;
      }

      return {
        orderBy: compositeOrder,
        joinInfo,
      };
    }

    if (isOrderByDirection(nestedFieldOrderByValue)) {
      const columnExpression = buildOrderByColumnExpression(
        joinAlias,
        nestedFieldMetadata.name,
      );

      return {
        orderBy: {
          [columnExpression]: {
            ...convertOrderByToFindOptionsOrder(
              nestedFieldOrderByValue,
              isForwardPagination,
            ),
            useLower: shouldUseCaseInsensitiveOrder(nestedFieldMetadata.type),
            castToText: shouldCastToText(nestedFieldMetadata.type),
          },
        },
        joinInfo,
      };
    }

    return null;
  }
}
