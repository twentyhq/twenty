import { FindOptionsWhere, ObjectLiteral } from 'typeorm';

import { RecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';

import { FieldMetadataMap } from 'src/engine/api/graphql/graphql-query-runner/utils/convert-object-metadata-to-map.util';

import { GraphqlQueryFilterFieldParser } from './graphql-query-filter-field.parser';

export class GraphqlQueryFilterConditionParser {
  private fieldMetadataMap: FieldMetadataMap;
  private fieldConditionParser: GraphqlQueryFilterFieldParser;

  constructor(fieldMetadataMap: FieldMetadataMap) {
    this.fieldMetadataMap = fieldMetadataMap;
    this.fieldConditionParser = new GraphqlQueryFilterFieldParser(
      this.fieldMetadataMap,
    );
  }

  /**
   * Parses the provided record filter conditions and returns the corresponding TypeORM `FindOptionsWhere` object(s).
   *
   * @param conditions - The record filter conditions to parse.
   * @param isNegated - Whether the conditions should be negated (i.e., `not`).
   * @returns The corresponding TypeORM `FindOptionsWhere` object(s).
   */
  public parse(
    conditions: RecordFilter,
    isNegated = false,
  ): FindOptionsWhere<ObjectLiteral> | FindOptionsWhere<ObjectLiteral>[] {
    if (Array.isArray(conditions)) {
      return this.handleAndCondition(conditions, isNegated);
    }

    const result: FindOptionsWhere<ObjectLiteral> = {};

    for (const [key, value] of Object.entries(conditions)) {
      if (key === 'and') {
        return this.handleAndCondition(value, isNegated);
      }
      if (key === 'or') {
        return this.handleOrCondition(value, isNegated);
      }
      if (key === 'not') {
        return this.parse(value, !isNegated);
      }

      Object.assign(
        result,
        this.fieldConditionParser.parse(key, value, isNegated),
      );
    }

    return result;
  }

  private handleAndCondition(
    conditions: RecordFilter[],
    isNegated: boolean,
  ): FindOptionsWhere<ObjectLiteral>[] {
    const parsedConditions = conditions.map((condition) =>
      this.parse(condition, isNegated),
    );

    return this.combineConditions(parsedConditions, isNegated ? 'or' : 'and');
  }

  private handleOrCondition(
    conditions: RecordFilter[],
    isNegated: boolean,
  ): FindOptionsWhere<ObjectLiteral>[] {
    const parsedConditions = conditions.map((condition) =>
      this.parse(condition, isNegated),
    );

    return this.combineConditions(parsedConditions, isNegated ? 'and' : 'or');
  }

  private combineConditions(
    conditions: (
      | FindOptionsWhere<ObjectLiteral>
      | FindOptionsWhere<ObjectLiteral>[]
    )[],
    combineType: 'and' | 'or',
  ): FindOptionsWhere<ObjectLiteral>[] {
    if (combineType === 'and') {
      let result: FindOptionsWhere<ObjectLiteral>[] = [{}];

      for (const condition of conditions) {
        if (Array.isArray(condition)) {
          const newResult: FindOptionsWhere<ObjectLiteral>[] = [];

          for (const existingCondition of result) {
            for (const orCondition of condition) {
              newResult.push({
                ...existingCondition,
                ...orCondition,
              });
            }
          }
          result = newResult;
        } else {
          result = result.map((existingCondition) => ({
            ...existingCondition,
            ...condition,
          }));
        }
      }

      return result;
    }

    return conditions.flat();
  }
}
