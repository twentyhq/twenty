import { isObject } from 'class-validator';
import { OrderByDirection } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { convertOrderByToFindOptionsOrder } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/convert-order-by-to-find-options-order';
import { getOptionalOrderByCasting } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/get-optional-order-by-casting.util';
import { parseCompositeFieldForOrder } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/parse-composite-field-for-order.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { formatColumnNamesFromCompositeFieldAndSubfields } from 'src/engine/twenty-orm/utils/format-column-names-from-composite-field-and-subfield.util';

import { type OrderByCondition } from './types/order-by-condition.type';
import { type ParseOrderByResult } from './types/parse-order-by-result.type';
import { type RelationJoinInfo } from './types/relation-join-info.type';

// Re-export types for backward compatibility
export { OrderByCondition, ParseOrderByResult, RelationJoinInfo };

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
    const orderByConditions: Record<string, OrderByCondition> = {};
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
          // For relation fields, input must be an object with nested field ordering
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
          // For composite fields, input must be an object with subfield ordering
          if (!isObject(orderByDirection)) {
            throw new GraphqlQueryRunnerException(
              `Composite field "${fieldName}" requires subfield ordering (e.g., { ${fieldName}: { subFieldName: 'AscNullsFirst' } })`,
              GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
              { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
            );
          }

          const compositeOrder = parseCompositeFieldForOrder(
            fieldMetadata,
            orderByDirection,
            objectNameSingular,
            isForwardPagination,
          );

          Object.assign(orderByConditions, compositeOrder);
        } else {
          // For scalar fields, input must be an OrderByDirection
          if (!this.isOrderByDirection(orderByDirection)) {
            throw new GraphqlQueryRunnerException(
              `Scalar field "${fieldName}" requires a direction value (AscNullsFirst, AscNullsLast, DescNullsFirst, DescNullsLast)`,
              GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
              { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
            );
          }

          const orderByCasting = getOptionalOrderByCasting(fieldMetadata);

          // Use unquoted property path for TypeORM's getMany() alias resolution
          orderByConditions[
            `${objectNameSingular}.${fieldName}${orderByCasting}`
          ] = convertOrderByToFindOptionsOrder(
            orderByDirection,
            isForwardPagination,
          );
        }
      }
    }

    return {
      orderBy: orderByConditions,
      relationJoins,
    };
  }

  private isOrderByDirection(value: unknown): value is OrderByDirection {
    return (
      typeof value === 'string' &&
      Object.values(OrderByDirection).includes(value as OrderByDirection)
    );
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
    orderBy: Record<string, OrderByCondition>;
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

    // Handle composite nested fields (like FULL_NAME)
    if (isCompositeFieldMetadataType(nestedFieldMetadata.type)) {
      if (!isObject(nestedFieldOrderByValue)) {
        throw new GraphqlQueryRunnerException(
          `Composite field "${nestedFieldMetadata.name}" requires a subfield to be specified`,
          GraphqlQueryRunnerExceptionCode.INVALID_QUERY_INPUT,
          { userFriendlyMessage: STANDARD_ERROR_MESSAGE },
        );
      }

      const compositeSubFields = Object.entries(
        nestedFieldOrderByValue as Record<string, OrderByDirection>,
      );

      const orderByConditions: Record<string, OrderByCondition> = {};

      for (const [subFieldName, direction] of compositeSubFields) {
        if (!this.isOrderByDirection(direction)) {
          continue;
        }

        const nestedColumnName =
          formatColumnNamesFromCompositeFieldAndSubfields(
            nestedFieldMetadata.name,
            [subFieldName],
          )[0];

        // Use unquoted property path for TypeORM's getMany() alias resolution
        orderByConditions[`${joinAlias}.${nestedColumnName}`] =
          convertOrderByToFindOptionsOrder(direction, isForwardPagination);
      }

      if (Object.keys(orderByConditions).length === 0) {
        return null;
      }

      return {
        orderBy: orderByConditions,
        joinInfo,
      };
    }

    // Handle regular scalar nested fields
    if (this.isOrderByDirection(nestedFieldOrderByValue)) {
      const nestedColumnName = nestedFieldMetadata.name;

      // Use unquoted property path for TypeORM's getMany() alias resolution
      return {
        orderBy: {
          [`${joinAlias}.${nestedColumnName}`]:
            convertOrderByToFindOptionsOrder(
              nestedFieldOrderByValue,
              isForwardPagination,
            ),
        },
        joinInfo,
      };
    }

    return null;
  }
}
