import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

export const BigFloatScalarType = new GraphQLScalarType({
  name: 'BigFloat',
  description:
    'A custom scalar type for representing big floating point numbers',
  serialize: (value: string): number => parseFloat(value),
  parseValue: (value: number): string => String(value),
  parseLiteral: (ast): string | null => {
    if (ast.kind === Kind.FLOAT || ast.kind === Kind.INT) {
      return String(ast.value);
    }

    return null;
  },
});
