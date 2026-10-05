import { GraphQLScalarType, Kind } from 'graphql';

import { ValidationError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

// Mirrors the ConnectionCursor scalar previously provided by
// @ptc-org/nestjs-query-graphql so the public schema stays unchanged.
export const ConnectionCursorScalarType = new GraphQLScalarType({
  name: 'ConnectionCursor',
  description: 'Cursor for paging through collections',
  serialize(value) {
    if (typeof value !== 'string') {
      throw new ValidationError('ConnectionCursor must be a string');
    }

    return value;
  },
  parseValue(value) {
    if (typeof value !== 'string') {
      throw new ValidationError('ConnectionCursor must be a string');
    }

    return value;
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new ValidationError('ConnectionCursor must be a string');
    }

    return ast.value;
  },
});
