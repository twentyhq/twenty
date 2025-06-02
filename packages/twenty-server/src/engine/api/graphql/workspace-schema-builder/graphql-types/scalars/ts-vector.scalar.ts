import { GraphQLScalarType } from 'graphql';

export const TSVectorScalarType = new GraphQLScalarType({
  name: 'TSVector',
  description: 'A custom scalar type for PostgreSQL tsvector fields',
  serialize(value: string): string {
    return value;
  },
  parseValue(value: string): string {
    return value;
  },
  parseLiteral(ast): string | null {
    if (ast.kind === 'StringValue') {
      return ast.value;
    }

    return null;
  },
});
