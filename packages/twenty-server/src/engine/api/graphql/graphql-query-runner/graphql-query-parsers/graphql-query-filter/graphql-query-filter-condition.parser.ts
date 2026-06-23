import { Brackets, NotBrackets, type WhereExpressionBuilder } from 'typeorm';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

import {
  FilterWhereConditionRecorder,
  type FilterWhereQueryBuilder,
} from './filter-where-condition-recorder';
import { GraphqlQueryFilterFieldParser } from './graphql-query-filter-field.parser';

export class GraphqlQueryFilterConditionParser {
  private flatObjectMetadata: FlatObjectMetadata;
  private queryFilterFieldParser: GraphqlQueryFilterFieldParser;

  constructor(
    flatObjectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
    flatObjectMetadataMaps?: FlatEntityMaps<FlatObjectMetadata>,
    depth = 0,
  ) {
    this.flatObjectMetadata = flatObjectMetadata;
    this.queryFilterFieldParser = new GraphqlQueryFilterFieldParser(
      this.flatObjectMetadata,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
      depth,
    );
  }

  public parse<QueryBuilder extends FilterWhereQueryBuilder>(
    queryBuilder: QueryBuilder,
    objectNameSingular: string,
    filter: Partial<ObjectRecordFilter>,
  ): QueryBuilder {
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

  // Reuses the exact same traversal as `parse` against a recorder rather than
  // a SQL-emitting builder. NOTE: this is also a validation pass — invalid
  // filter inputs (e.g. an empty `in: []`) make the field parser throw, so
  // callers must treat a thrown exception as "invalid filter", not just a
  // `false` return.
  public producesWhereCondition(
    objectNameSingular: string,
    filter: Partial<ObjectRecordFilter>,
  ): boolean {
    const recorder = new FilterWhereConditionRecorder();

    this.parse(recorder, objectNameSingular, filter);

    return recorder.hasWhereCondition;
  }

  public applyFilterEntriesToWhereBrackets(
    innerQueryBuilder: WhereExpressionBuilder,
    outerQueryBuilder: FilterWhereQueryBuilder,
    objectNameSingular: string,
    filter: Partial<ObjectRecordFilter>,
  ): void {
    Object.entries(filter).forEach(([key, value], index) => {
      this.parseKeyFilter(
        innerQueryBuilder,
        outerQueryBuilder,
        objectNameSingular,
        key,
        value,
        index === 0,
      );
    });
  }

  private parseKeyFilter(
    queryBuilder: WhereExpressionBuilder,
    outerQueryBuilder: FilterWhereQueryBuilder,
    objectNameSingular: string,
    key: string,
    // oxlint-disable-next-line typescript/no-explicit-any
    value: any,
    isFirst = false,
  ): void {
    switch (key) {
      case 'and': {
        const andWhereCondition = new Brackets((qb) => {
          value.forEach((filter: ObjectRecordFilter, index: number) => {
            const whereCondition = new Brackets((qb2) => {
              Object.entries(filter).forEach(
                ([subFilterkey, subFilterValue], index) => {
                  this.parseKeyFilter(
                    qb2,
                    outerQueryBuilder,
                    objectNameSingular,
                    subFilterkey,
                    subFilterValue,
                    index === 0,
                  );
                },
              );
            });

            if (index === 0) {
              qb.where(whereCondition);
            } else {
              qb.andWhere(whereCondition);
            }
          });
        });

        if (isFirst) {
          queryBuilder.where(andWhereCondition);
        } else {
          queryBuilder.andWhere(andWhereCondition);
        }
        break;
      }
      case 'or': {
        const orWhereCondition = new Brackets((qb) => {
          value.forEach((filter: ObjectRecordFilter, index: number) => {
            const whereCondition = new Brackets((qb2) => {
              Object.entries(filter).forEach(
                ([subFilterkey, subFilterValue], index) => {
                  this.parseKeyFilter(
                    qb2,
                    outerQueryBuilder,
                    objectNameSingular,
                    subFilterkey,
                    subFilterValue,
                    index === 0,
                  );
                },
              );
            });

            if (index === 0) {
              qb.where(whereCondition);
            } else {
              qb.orWhere(whereCondition);
            }
          });
        });

        if (isFirst) {
          queryBuilder.where(orWhereCondition);
        } else {
          queryBuilder.andWhere(orWhereCondition);
        }

        break;
      }
      case 'not': {
        const notWhereCondition = new NotBrackets((qb) => {
          Object.entries(value).forEach(
            ([subFilterkey, subFilterValue], index) => {
              this.parseKeyFilter(
                qb,
                outerQueryBuilder,
                objectNameSingular,
                subFilterkey,
                subFilterValue,
                index === 0,
              );
            },
          );
        });

        if (isFirst) {
          queryBuilder.where(notWhereCondition);
        } else {
          queryBuilder.andWhere(notWhereCondition);
        }

        break;
      }
      default:
        this.queryFilterFieldParser.parse(
          queryBuilder,
          outerQueryBuilder,
          objectNameSingular,
          key,
          value,
          isFirst,
        );
        break;
    }
  }
}
