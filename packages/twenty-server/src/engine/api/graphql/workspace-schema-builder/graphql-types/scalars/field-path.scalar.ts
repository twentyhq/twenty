import { GraphQLScalarType, Kind } from 'graphql';
import { validate as uuidValidate } from 'uuid';

const checkFieldPath = (value: any): string[] => {
  if (!Array.isArray(value)) {
    throw new Error('Field path must be a string');
  }

  value.forEach((fieldMetadataIdCandidate) => {
    if (!uuidValidate(fieldMetadataIdCandidate)) {
      throw new Error('Invalid field path');
    }
  });

  return value;
};

export const FieldPathScalarType = new GraphQLScalarType({
  name: 'FieldPath',
  description: 'A field path scalar type',
  serialize: checkFieldPath,
  parseValue: checkFieldPath,
  parseLiteral(ast): string[] {
    if (ast.kind !== Kind.LIST) {
      throw new Error('Field path must be a list');
    }

    return ast.values.map((value) => {
      if (value.kind !== Kind.STRING) {
        throw new Error('Each UUID in the field path must be a string');
      }

      return value.value;
    });
  },
});
