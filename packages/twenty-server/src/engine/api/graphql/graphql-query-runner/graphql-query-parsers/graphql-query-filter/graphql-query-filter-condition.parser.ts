import { Brackets, type WhereExpressionBuilder } from 'typeorm';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { applyFilterEntriesToWhereExpression } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/utils/apply-filter-entries-to-where-expression.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type LiteFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/lite-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

import { GraphqlQueryFilterFieldParser } from './graphql-query-filter-field.parser';
import { type RecordQueryBuilder } from 'src/engine/api/graphql/graphql-query-runner/types/record-query-builder.type';

export class GraphqlQueryFilterConditionParser {
  private queryFilterFieldParser: GraphqlQueryFilterFieldParser;

  constructor(
    flatObjectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<LiteFlatFieldMetadata>,
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
    queryBuilder: RecordQueryBuilder,
    objectNameSingular: string,
    filter: Partial<ObjectRecordFilter>,
  ): RecordQueryBuilder {
    if (!filter || Object.keys(filter).length === 0) {
      return queryBuilder;
    }

    queryBuilder.where(
      new Brackets((qb) => {
        this.applyFilterEntriesToWhereBrackets(
          qb,
          queryBuilder,
          objectNameSingular,
          filter,
        );
      }),
    );

    return queryBuilder;
  }

  public applyFilterEntriesToWhereBrackets(
    innerQueryBuilder: WhereExpressionBuilder,
    outerQueryBuilder: RecordQueryBuilder,
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
