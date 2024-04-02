import { GraphQLScalarType } from 'graphql';

export const BigIntScalarType = new GraphQLScalarType({
  name: 'BigInt',
  description:
    'The `BigInt` scalar type represents non-fractional signed whole numeric values.',
  serialize: (value: bigint): string => value.toString(),
  parseValue: (value: string): bigint => BigInt(value),
  parseLiteral: (ast): bigint | null => {
    if (ast.kind === 'IntValue') {
      return BigInt(ast.value);
    }

    return null;
  },
});
