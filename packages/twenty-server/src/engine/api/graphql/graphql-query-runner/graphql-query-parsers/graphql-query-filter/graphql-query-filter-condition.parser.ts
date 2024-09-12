import { FindOptionsWhere, ObjectLiteral } from 'typeorm';

import { RecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';

import { FieldMetadataMap } from 'src/engine/metadata-modules/utils/generate-object-metadata-map.util';

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
        case 'and': {
          const andConditions = this.parseAndCondition(value, isNegated);

          return andConditions.map((condition) => ({
            ...result,
            ...condition,
          }));
        }
        case 'or': {
          const orConditions = this.parseOrCondition(value, isNegated);

          return orConditions.map((condition) => ({ ...result, ...condition }));
        }
        case 'not':
          Object.assign(result, this.parse(value, !isNegated));
          break;
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
      return conditions.reduce<FindOptionsWhere<ObjectLiteral>[]>(
        (acc, condition) => {
          if (Array.isArray(condition)) {
            return acc.flatMap((accCondition) =>
              condition.map((subCondition) => ({
                ...accCondition,
                ...subCondition,
              })),
            );
          }

          return acc.map((accCondition) => ({
            ...accCondition,
            ...condition,
          }));
        },
        [{}],
      );
    }

    return conditions.flatMap((condition) =>
      Array.isArray(condition) ? condition : [condition],
    );
  }
}
