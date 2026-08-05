import {
  Brackets,
  type ObjectLiteral,
  type WhereExpressionBuilder,
} from 'typeorm';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { applyFilterEntriesToWhereExpression } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/utils/apply-filter-entries-to-where-expression.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';

import { GraphqlQueryFilterFieldParser } from './graphql-query-filter-field.parser';

export class GraphqlQueryFilterConditionParser {
  private queryFilterFieldParser: GraphqlQueryFilterFieldParser;

  constructor(
    flatObjectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
    flatObjectMetadataMaps?: FlatEntityMaps<FlatObjectMetadata>,
    depth = 0,
  ) {
    this.queryFilterFieldParser = new GraphqlQueryFilterFieldParser(
      flatObjectMetadata,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
      depth,
    );
  }

  public parse(
    queryBuilder: WorkspaceSelectQueryBuilder<ObjectLiteral>,
    objectNameSingular: string,
    filter: Partial<ObjectRecordFilter>,
  ): WorkspaceSelectQueryBuilder<ObjectLiteral> {
    if (!filter || Object.keys(filter).length === 0) {
      return queryBuilder;
    }

    return queryBuilder.where(
      new Brackets((qb) => {
        this.applyFilterEntriesToWhereBrackets(
          qb,
          queryBuilder,
          objectNameSingular,
          filter,
        );
      }),
    );
  }

  public applyFilterEntriesToWhereBrackets(
    innerQueryBuilder: WhereExpressionBuilder,
    outerQueryBuilder: WorkspaceSelectQueryBuilder<ObjectLiteral>,
    objectNameSingular: string,
    filter: Partial<ObjectRecordFilter>,
  ): void {
    applyFilterEntriesToWhereExpression({
      whereExpression: innerQueryBuilder,
      outerQueryBuilder,
      objectNameSingular,
      filter,
      fieldParser: this.queryFilterFieldParser,
    });
  }
}
