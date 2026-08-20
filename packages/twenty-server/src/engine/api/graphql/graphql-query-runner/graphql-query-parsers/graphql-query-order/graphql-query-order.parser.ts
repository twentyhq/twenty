import { type ObjectsPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordOrderBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import {
  buildOrderByColumnExpression,
  shouldCastToText,
  shouldUseCaseInsensitiveOrder,
} from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/build-order-by-column-expression.util';
import { convertOrderByToFindOptionsOrder } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-order/utils/convert-order-by-to-find-options-order';
import { computeOrderByLeafColumn } from 'src/engine/api/utils/compute-order-by-leaf-column.util';
import { resolveOrderByLeaves } from 'src/engine/api/utils/resolve-order-by-leaves.utils';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

import { type OrderByClause } from './types/order-by-condition.type';
import { type ParseOrderByResult } from './types/parse-order-by-result.type';
import { type RelationJoinInfo } from './types/relation-join-info.type';

// Re-export types for backward compatibility
export { OrderByClause, ParseOrderByResult, RelationJoinInfo };

// Compiles SQL ORDER BY clauses from the resolved orderBy leaves: walking,
// validation and permission checks live in resolveOrderByLeaves, shared with
// column selection and the cursor utilities, so the scan order can never
// diverge from what cursors continue.
export class GraphqlQueryOrderFieldParser {
  private flatObjectMetadata: FlatObjectMetadata;
  private flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  private flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;

  constructor(
    flatObjectMetadata: FlatObjectMetadata,
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ) {
    this.flatObjectMetadata = flatObjectMetadata;
    this.flatObjectMetadataMaps = flatObjectMetadataMaps;
    this.flatFieldMetadataMaps = flatFieldMetadataMaps;
  }

  parse(
    orderBy: ObjectRecordOrderBy,
    objectNameSingular: string,
    isForwardPagination = true,
    objectsPermissions?: ObjectsPermissions,
  ): ParseOrderByResult {
    const orderByConditions: Record<string, OrderByClause> = {};
    const relationJoins: RelationJoinInfo[] = [];
    const addedJoinAliases = new Set<string>();

    const orderByLeaves = resolveOrderByLeaves({
      orderBy,
      flatObjectMetadata: this.flatObjectMetadata,
      flatObjectMetadataMaps: this.flatObjectMetadataMaps,
      flatFieldMetadataMaps: this.flatFieldMetadataMaps,
      strictValidation: true,
      objectsPermissions,
    });

    for (const orderByLeaf of orderByLeaves) {
      const leafColumn = computeOrderByLeafColumn(
        orderByLeaf,
        objectNameSingular,
      );

      if (!isDefined(leafColumn)) {
        continue;
      }

      if (
        orderByLeaf.kind === 'relation' &&
        !addedJoinAliases.has(leafColumn.tableAlias)
      ) {
        relationJoins.push({ joinAlias: leafColumn.tableAlias });
        addedJoinAliases.add(leafColumn.tableAlias);
      }

      orderByConditions[
        buildOrderByColumnExpression(
          leafColumn.tableAlias,
          leafColumn.columnName,
        )
      ] = {
        ...convertOrderByToFindOptionsOrder(
          orderByLeaf.direction,
          isForwardPagination,
        ),
        useLower: shouldUseCaseInsensitiveOrder(leafColumn.columnType),
        castToText: shouldCastToText(leafColumn.columnType),
      };
    }

    return {
      orderBy: orderByConditions,
      relationJoins,
    };
  }
}
