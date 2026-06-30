import { GraphQLScalarType } from 'graphql';
import { type IntValueNode, Kind } from 'graphql/language';

import { ValidationError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export const TimeScalarType = new GraphQLScalarType({
  name: 'Time',
  description: 'Time custom scalar type',
  serialize(value: Date): number {
    return value.getTime();
  },
  parseValue(value: number): Date {
    return new Date(value);
  },
  parseLiteral(ast): Date {
    if (ast.kind === Kind.INT) {
      const intAst = ast as IntValueNode;

      if (typeof intAst.value === 'number') {
        return new Date(intAst.value);
      }
      throw new ValidationError(`Invalid timestamp value: ${ast.value}`);
    }
    throw new ValidationError(`Invalid AST kind: ${ast.kind}`);
  },
});
