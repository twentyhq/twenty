import { GraphQLScalarType } from 'graphql';
import { Maybe } from 'graphql-yoga';
import { ObjMap } from 'graphql/jsutils/ObjMap';
import { ASTNode, Kind, ValueNode } from 'graphql/language';

import { ValidationError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

const parseLiteral = (
  ast: ValueNode,
  variables?: Maybe<ObjMap<unknown>>,
): any => {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value;
    case Kind.INT:
    case Kind.FLOAT:
      return parseFloat(ast.value);
    case Kind.OBJECT:
      return parseObject(ast as any, variables);
    case Kind.LIST:
      return (ast as any).values.map((n: ValueNode) =>
        parseLiteral(n, variables),
      );
    case Kind.NULL:
      return null;
    case Kind.VARIABLE:
      return variables ? variables[ast.name.value] : undefined;
    default:
      throw new ValidationError(
        `JSONStringify cannot represent value: ${JSON.stringify(ast)}`,
      );
  }
};

const parseObject = (
  ast: ASTNode,
  variables?: Maybe<ObjMap<unknown>>,
): object => {
  const value = Object.create(null);

  if ('fields' in ast) {
    ast.fields?.forEach((field: any) => {
      value[field.name.value] = parseLiteral(field.value, variables);
    });
  }

  return value;
};

const stringify = (value: any): string => {
  return JSON.stringify(value);
};

const parseJSON = (value: string): object => {
  try {
    return JSON.parse(value);
  } catch (e) {
    throw new ValidationError(`Value is not valid JSON: ${value}`);
  }
};

export const RawJSONScalar = new GraphQLScalarType({
  name: 'RawJSONScalar',
  description:
    'The `RawJSONScalar` scalar type represents JSON values, but stringifies inputs and parses outputs.',
  serialize: parseJSON,
  parseValue: stringify,
  parseLiteral: (ast, variables) => {
    if (ast.kind === Kind.STRING) {
      return stringify(ast.value);
    } else {
      return stringify(parseLiteral(ast, variables));
    }
  },
});
