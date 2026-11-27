import { Brackets, type WhereExpressionBuilder } from 'typeorm';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { applyFilterEntriesToWhereExpression } from 'src/engine/api/common/common-query-parsers/utils/apply-filter-entries-to-where-expression.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

import {
  CommonQueryFilterFieldParser,
  type ParentFilterScope,
} from './common-query-filter-field.parser';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/query-builder/workspace-select-query-builder';

export class CommonQueryFilterConditionParser {
  private queryFilterFieldParser: CommonQueryFilterFieldParser;

  constructor({
    flatObjectMetadata,
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
    depth = 0,
    parentFilterScope,
  }: {
    flatObjectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
    flatObjectMetadataMaps?: FlatEntityMaps<FlatObjectMetadata>;
    depth?: number;
    parentFilterScope?: ParentFilterScope;
  }) {
    this.queryFilterFieldParser = new CommonQueryFilterFieldParser({
      flatObjectMetadata,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
      depth,
      parentFilterScope,
    });
  }

  public parse({
    queryBuilder,
    objectNameSingular,
    filter,
  }: {
    queryBuilder: WorkspaceSelectQueryBuilder;
    objectNameSingular: string;
    filter: Partial<ObjectRecordFilter>;
  }): WorkspaceSelectQueryBuilder {
    if (!filter || Object.keys(filter).length === 0) {
      return queryBuilder;
    }

    queryBuilder.where(
      new Brackets((qb) => {
        this.applyFilterEntriesToWhereBrackets({
          innerQueryBuilder: qb,
          outerQueryBuilder: queryBuilder,
          objectNameSingular,
          filter,
        });
      }),
    );

    return queryBuilder;
  }

  public parseCursorFilter({
    queryBuilder,
    objectNameSingular,
    cursorFilter,
  }: {
    queryBuilder: WorkspaceSelectQueryBuilder;
    objectNameSingular: string;
    cursorFilter: Partial<ObjectRecordFilter>;
  }): WorkspaceSelectQueryBuilder {
    return queryBuilder.andWhereReadingUnreadableColumnsAsNull({
      condition: new Brackets((whereBracketsBuilder) => {
        this.applyFilterEntriesToWhereBrackets({
          innerQueryBuilder: whereBracketsBuilder,
          outerQueryBuilder: queryBuilder,
          objectNameSingular,
          filter: cursorFilter,
        });
      }),
    });
  }

  public applyFilterEntriesToWhereBrackets({
    innerQueryBuilder,
    outerQueryBuilder,
    objectNameSingular,
    filter,
  }: {
    innerQueryBuilder: WhereExpressionBuilder;
    outerQueryBuilder: WorkspaceSelectQueryBuilder;
    objectNameSingular: string;
    filter: Partial<ObjectRecordFilter>;
  }): void {
    applyFilterEntriesToWhereExpression({
      whereExpression: innerQueryBuilder,
      outerQueryBuilder,
      objectNameSingular,
      filter,
      fieldParser: this.queryFilterFieldParser,
    });
  }
}
