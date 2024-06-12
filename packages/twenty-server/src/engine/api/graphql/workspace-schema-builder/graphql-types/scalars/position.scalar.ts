import { GraphQLScalarType, Kind } from 'graphql';

type PositionType = 'first' | 'last' | number;

const isValidStringPosition = (value: string): boolean =>
  typeof value === 'string' && (value === 'first' || value === 'last');

const isValidNumberPosition = (value: number): boolean =>
  typeof value === 'number';

const checkPosition = (value: any): PositionType => {
  if (isValidNumberPosition(value) || isValidStringPosition(value)) {
    return value;
  }

  throw new Error('Invalid position found');
};

export const PositionScalarType = new GraphQLScalarType({
  name: 'Position',
  description:
    'A custom scalar type for representing record position in a list',
  serialize: checkPosition,
  parseValue: checkPosition,
  parseLiteral(ast): PositionType {
    if (
      ast.kind == Kind.STRING &&
      (ast.value === 'first' || ast.value === 'last')
    ) {
      return ast.value;
    }

    if (ast.kind == Kind.INT || ast.kind == Kind.FLOAT) {
      return parseFloat(ast.value);
    }

    throw new Error('Invalid position found');
  },
});
