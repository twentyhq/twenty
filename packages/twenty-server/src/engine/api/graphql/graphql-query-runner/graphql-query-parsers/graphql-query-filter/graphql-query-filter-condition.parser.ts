import { Brackets, NotBrackets, type WhereExpressionBuilder } from 'typeorm';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceSelectQueryBuilder } from 'src/engine/twenty-orm/repository/workspace-select-query-builder';

import { GraphqlQueryFilterFieldParser } from './graphql-query-filter-field.parser';

export class GraphqlQueryFilterConditionParser {
  private flatObjectMetadata: FlatObjectMetadata;
  private queryFilterFieldParser: GraphqlQueryFilterFieldParser;

  constructor(
    flatObjectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ) {
    this.flatObjectMetadata = flatObjectMetadata;
    this.queryFilterFieldParser = new GraphqlQueryFilterFieldParser(
      this.flatObjectMetadata,
      flatFieldMetadataMaps,
    );
  }

  public parse(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryBuilder: WorkspaceSelectQueryBuilder<any>,
    objectNameSingular: string,
    filter: Partial<ObjectRecordFilter>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): WorkspaceSelectQueryBuilder<any> {
    if (!filter || Object.keys(filter).length === 0) {
      return queryBuilder;
    }

    return queryBuilder.where(
      new Brackets((qb) => {
        Object.entries(filter).forEach(([key, value], index) => {
          this.parseKeyFilter(qb, objectNameSingular, key, value, index === 0);
        });
      }),
    );
  }

  private parseKeyFilter(
    queryBuilder: WhereExpressionBuilder,
    objectNameSingular: string,
    key: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          objectNameSingular,
          key,
          value,
          isFirst,
        );
        break;
    }
  }
}
