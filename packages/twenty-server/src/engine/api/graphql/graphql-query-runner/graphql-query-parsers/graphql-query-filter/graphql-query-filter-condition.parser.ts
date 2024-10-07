import {
  Brackets,
  NotBrackets,
  SelectQueryBuilder,
  WhereExpressionBuilder,
} from 'typeorm';

import { RecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';

import { FieldMetadataMap } from 'src/engine/metadata-modules/utils/generate-object-metadata-map.util';

import { GraphqlQueryFilterFieldParser } from './graphql-query-filter-field.parser';

export class GraphqlQueryFilterConditionParser {
  private fieldMetadataMap: FieldMetadataMap;
  private queryFilterFieldParser: GraphqlQueryFilterFieldParser;

  constructor(fieldMetadataMap: FieldMetadataMap) {
    this.fieldMetadataMap = fieldMetadataMap;
    this.queryFilterFieldParser = new GraphqlQueryFilterFieldParser(
      this.fieldMetadataMap,
    );
  }

  public parse(
    queryBuilder: SelectQueryBuilder<any>,
    objectNameSingular: string,
    filter: Partial<RecordFilter>,
  ): SelectQueryBuilder<any> {
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
    value: any,
    isFirst = false,
  ): void {
    switch (key) {
      case 'and': {
        const andWhereCondition = new Brackets((qb) => {
          value.forEach((filter: RecordFilter, index: number) => {
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
          value.forEach((filter: RecordFilter, index: number) => {
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
