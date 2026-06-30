import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

export const DateScalarType = new GraphQLScalarType({
  name: 'Date',
  description:
    "Date custom scalar type, as a string in format yyyy-MM-dd (ex: 2025-12-31), we don't signify time nor timezone for DATE.",
  serialize(value: string): string {
    return value;
  },
  parseValue(value: string): string {
    return value;
  },
  parseLiteral(ast): string | null {
    if (ast.kind === Kind.STRING) {
      return ast.value;
    }

    return null;
  },
});
