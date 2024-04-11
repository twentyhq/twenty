import { isString } from 'class-validator';
import { GraphQLScalarType } from 'graphql';
import GraphQLJSON from 'graphql-type-json';

export const JsonScalarType = new GraphQLScalarType({
  ...GraphQLJSON,
  parseValue: (value) => {
    if (isString(value) && isString(JSON.parse(value))) {
      throw new Error(`Strings are not supported as JSON: ${value}`);
    }

    return GraphQLJSON.parseValue(value);
  },
});
