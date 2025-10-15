import { GraphQLScalarType, Kind } from 'graphql';
import { validate as uuidValidate } from 'uuid';

import { ValidationError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const checkUUID = (value: any): string => {
  if (typeof value !== 'string') {
    throw new ValidationError('UUID must be a string');
  }
  if (!uuidValidate(value)) {
    throw new ValidationError(`Invalid UUID`, {
      value,
    });
  }

  return value;
};

export const UUIDScalarType = new GraphQLScalarType({
  name: 'UUID',
  description: 'A UUID scalar type',
  serialize: checkUUID,
  parseValue: checkUUID,
  parseLiteral(ast): string {
    if (ast.kind !== Kind.STRING) {
      throw new ValidationError('UUID must be a string');
    }

    return ast.value;
  },
});
