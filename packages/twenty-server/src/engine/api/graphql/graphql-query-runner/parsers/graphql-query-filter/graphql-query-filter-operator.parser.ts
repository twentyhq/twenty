import {
  FindOperator,
  ILike,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
} from 'typeorm';

export class GraphqlQueryFilterOperatorParser {
  private operatorMap: { [key: string]: (value: any) => FindOperator<any> };

  constructor() {
    this.operatorMap = {
      eq: (value: any) => value,
      neq: (value: any) => Not(value),
      gt: (value: any) => MoreThan(value),
      gte: (value: any) => MoreThanOrEqual(value),
      lt: (value: any) => LessThan(value),
      lte: (value: any) => LessThanOrEqual(value),
      in: (value: any) => In(value),
      is: (value: any) => (value === 'NULL' ? IsNull() : value),
      like: (value: string) => Like(`%${value}%`),
      ilike: (value: string) => ILike(`%${value}%`),
      startsWith: (value: string) => ILike(`${value}%`),
      endsWith: (value: string) => ILike(`%${value}`),
    };
  }

  /**
   * Parses an operator object and returns a TypeORM `FindOperator` based on the operator and value.
   *
   * @param operatorObj - An object containing the operator and value to be parsed.
   * @param isNegated - A boolean indicating whether the operator should be negated.
   * @returns A TypeORM `FindOperator` that represents the parsed operator and value.
   * @throws {Error} If the operator is not supported.
   */
  public parseOperator(
    operatorObj: Record<string, any>,
    isNegated: boolean,
  ): FindOperator<any> {
    const [[operator, value]] = Object.entries(operatorObj);

    if (operator in this.operatorMap) {
      const operatorFunction = this.operatorMap[operator];

      return isNegated ? Not(operatorFunction(value)) : operatorFunction(value);
    }

    throw new Error(`Operator not supported: ${operator}`);
  }
}
