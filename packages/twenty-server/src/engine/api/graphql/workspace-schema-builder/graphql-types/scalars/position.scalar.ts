import { GraphQLScalarType, Kind } from 'graphql';

import { ValidationError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

type PositionType = 'first' | 'last' | number;

const VALID_STRING_POSITIONS = ['first', 'last'] as const;

type ValidStringPosition = (typeof VALID_STRING_POSITIONS)[number];

const isValidStringPosition = (value: unknown): value is ValidStringPosition =>
  typeof value === 'string' &&
  VALID_STRING_POSITIONS.includes(value as ValidStringPosition);

const isValidNumberPosition = (value: unknown): value is number =>
  typeof value === 'number' && !isNaN(value) && isFinite(value);

const checkPosition = (value: unknown): PositionType => {
  if (isValidNumberPosition(value)) {
    return value;
  }

  if (isValidStringPosition(value)) {
    return value;
  }

  throw new ValidationError(
    `Invalid position value: '${value}'. Position must be 'first', 'last', or a finite number`,
  );
};

export const PositionScalarType = new GraphQLScalarType({
  name: 'Position',
  description:
    'A custom scalar type for representing record position in a list',
  serialize: checkPosition,
  parseValue: checkPosition,
  parseLiteral(ast): PositionType {
    if (ast.kind === Kind.STRING) {
      if (isValidStringPosition(ast.value)) {
        return ast.value;
      }
      throw new ValidationError(
        `Invalid string position value: '${ast.value}'. Must be 'first' or 'last'`,
      );
    }

    if (ast.kind === Kind.INT || ast.kind === Kind.FLOAT) {
      const numericValue = parseFloat(ast.value);

      if (isValidNumberPosition(numericValue)) {
        return numericValue;
      }
      throw new ValidationError(
        `Invalid numeric position value: '${ast.value}'. Must be a finite number`,
      );
    }

    throw new ValidationError(
      `Invalid position AST kind: '${ast.kind}'. Expected STRING, INT, or FLOAT`,
    );
  },
});
