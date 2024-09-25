import {
  Brackets,
  NotBrackets,
  SelectQueryBuilder,
  WhereExpressionBuilder,
} from 'typeorm';

import { RecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';

import { FieldMetadataMap } from 'src/engine/metadata-modules/utils/generate-object-metadata-map.util';

import { GraphqlQueryFilterFieldParser } from './graphql-query-filter-field.parser';

type LogicOperator = 'and' | 'or' | 'not';

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
    filter: RecordFilter,
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
    value: unknown,
    isFirst = false,
  ): void {
    if (this.isLogicOperator(key)) {
      this.handleFilterType(
        queryBuilder,
        objectNameSingular,
        key,
        value as RecordFilter[],
        isFirst,
      );
    } else {
      this.queryFilterFieldParser.parse(
        queryBuilder,
        objectNameSingular,
        key,
        value,
        isFirst,
      );
    }
  }

  private isLogicOperator(key: string): key is LogicOperator {
    return ['and', 'or', 'not'].includes(key);
  }

  private handleFilterType(
    queryBuilder: WhereExpressionBuilder,
    objectNameSingular: string,
    filterType: LogicOperator,
    filters: RecordFilter[],
    isFirst: boolean,
  ): void {
    const whereCondition = this.createWhereCondition(
      objectNameSingular,
      filterType,
      filters,
    );

    if (isFirst) {
      queryBuilder.where(whereCondition);
    } else {
      queryBuilder.andWhere(whereCondition);
    }
  }

  private createWhereCondition(
    objectNameSingular: string,
    filterType: LogicOperator,
    filters: RecordFilter[],
  ): Brackets | NotBrackets {
    if (filterType === 'not') {
      return new NotBrackets((qb) =>
        this.applyFilters(qb, objectNameSingular, filters[0], 'and'),
      );
    }

    return new Brackets((qb) =>
      this.applyFilters(qb, objectNameSingular, filters, filterType),
    );
  }

  private applyFilters(
    queryBuilder: WhereExpressionBuilder,
    objectNameSingular: string,
    filters: RecordFilter | RecordFilter[],
    filterType: 'and' | 'or',
  ): void {
    const filtersArray = Array.isArray(filters) ? filters : [filters];

    filtersArray.forEach((filter, index) => {
      const whereCondition = new Brackets((qb) => {
        Object.entries(filter).forEach(
          ([subFilterKey, subFilterValue], subIndex) => {
            this.parseKeyFilter(
              qb,
              objectNameSingular,
              subFilterKey,
              subFilterValue,
              subIndex === 0,
            );
          },
        );
      });

      if (index === 0) {
        queryBuilder.where(whereCondition);
      } else if (filterType === 'and') {
        queryBuilder.andWhere(whereCondition);
      } else {
        queryBuilder.orWhere(whereCondition);
      }
    });
  }
}
