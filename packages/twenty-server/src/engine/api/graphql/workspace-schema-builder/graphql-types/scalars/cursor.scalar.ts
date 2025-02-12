import { GraphQLScalarType, Kind } from 'graphql';

import { ValidationError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

export const CursorScalarType = new GraphQLScalarType({
  name: 'Cursor',
  description: 'A custom scalar that represents a cursor for pagination',
  serialize(value) {
    if (typeof value !== 'string') {
      throw new ValidationError('Cursor must be a string');
    }

    return value;
  },
  parseValue(value) {
    if (typeof value !== 'string') {
      throw new ValidationError('Cursor must be a string');
    }

    return value;
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new ValidationError('Cursor must be a string');
    }

    return ast.value;
  },
});
