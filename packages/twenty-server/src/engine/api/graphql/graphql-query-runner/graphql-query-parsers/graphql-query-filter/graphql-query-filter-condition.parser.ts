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

  public parse(
    conditions: RecordFilter,
    isNegated = false,
  ): FindOptionsWhere<ObjectLiteral> | FindOptionsWhere<ObjectLiteral>[] {
    if (Array.isArray(conditions)) {
      return this.parseAndCondition(conditions, isNegated);
    }

    const result: FindOptionsWhere<ObjectLiteral> = {};

    for (const [key, value] of Object.entries(conditions)) {
      switch (key) {
        case 'and':
          return this.parseAndCondition(value, isNegated);
        case 'or':
          return this.parseOrCondition(value, isNegated);
        case 'not':
          return this.parse(value, !isNegated);
        default:
          Object.assign(
            result,
            this.fieldConditionParser.parse(key, value, isNegated),
          );
      }
    }

    return result;
  }

  private parseAndCondition(
    conditions: RecordFilter[],
    isNegated: boolean,
  ): FindOptionsWhere<ObjectLiteral>[] {
    const parsedConditions = conditions.map((condition) =>
      this.parse(condition, isNegated),
    );

    return this.combineConditions(parsedConditions, isNegated ? 'or' : 'and');
  }

  private parseOrCondition(
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
