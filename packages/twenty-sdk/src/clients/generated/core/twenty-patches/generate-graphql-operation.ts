// @ts-nocheck
// Generates GraphQL operation strings from a declarative request object.
// Uses convention-based type inference for argument types so the core
// client works without a genql-generated type map.
import type {
  LinkedField,
  LinkedType,
  GraphqlOperation,
} from './types';
import { inferArgType } from './twenty-arg-type-inference';

type Request = boolean | number | Fields;

type Fields = {
  [field: string]: Request;
};

type Variables = {
  [name: string]: {
    value: unknown;
    typing: [LinkedType, string];
  };
};

type Context = {
  root: LinkedType;
  varCounter: number;
  variables: Variables;
  fragmentCounter: number;
  fragments: string[];
};

const getFieldFromPath = (
  root: LinkedType | undefined,
  path: string[],
): LinkedField | undefined => {
  let current: LinkedField | undefined;

  if (!root) return undefined;
  if (path.length === 0) return undefined;

  for (const fieldName of path) {
    const type = current ? current.type : root;

    if (!type?.fields) return undefined;

    const possibleTypes = Object.keys(type.fields)
      .filter((key) => key.startsWith('on_'))
      .reduce(
        (types, key) => {
          const field = type.fields && type.fields[key];
          if (field) types.push(field.type);
          return types;
        },
        [type],
      );

    let field: LinkedField | null = null;

    for (const possibleType of possibleTypes) {
      const found = possibleType.fields && possibleType.fields[fieldName];
      if (found) {
        field = found;
        break;
      }
    }

    if (!field) return undefined;

    current = field;
  }

  return current;
};

const parseRequest = (
  request: Request | undefined,
  ctx: Context,
  path: string[],
): string => {
  if (typeof request === 'object' && '__args' in request) {
    const args: any = request.__args;
    let fields: Request | undefined = { ...request };
    delete fields.__args;
    const argNames = Object.keys(args);

    if (argNames.length === 0) {
      return parseRequest(fields, ctx, path);
    }

    const field = getFieldFromPath(ctx.root, path);

    const argStrings = argNames.map((argName) => {
      ctx.varCounter++;
      const varName = `v${ctx.varCounter}`;

      const typing = field?.args && field.args[argName];

      if (typing) {
        ctx.variables[varName] = {
          value: args[argName],
          typing,
        };
      } else {
        const operationName = path[0] || '';
        const inferredType = inferArgType(operationName, argName);

        ctx.variables[varName] = {
          value: args[argName],
          typing: [{ name: inferredType }, inferredType],
        };
      }

      return `${argName}:$${varName}`;
    });
    return `(${argStrings})${parseRequest(fields, ctx, path)}`;
  } else if (
    typeof request === 'object' &&
    Object.keys(request).length > 0
  ) {
    const fields = request;
    const fieldNames = Object.keys(fields).filter((key) =>
      Boolean(fields[key]),
    );

    if (fieldNames.length === 0) {
      throw new Error(
        `field selection should not be empty: ${path.join('.')}`,
      );
    }

    const field =
      path.length > 0 ? getFieldFromPath(ctx.root, path) : null;
    const type = field ? field.type : ctx.root;
    const scalarFields = type?.scalar;

    let scalarFieldsFragment: string | undefined;

    if (fieldNames.includes('__scalar')) {
      const falsyFieldNames = new Set(
        Object.keys(fields).filter((key) => !Boolean(fields[key])),
      );
      if (scalarFields?.length) {
        ctx.fragmentCounter++;
        scalarFieldsFragment = `f${ctx.fragmentCounter}`;

        ctx.fragments.push(
          `fragment ${scalarFieldsFragment} on ${
            type.name
          }{${scalarFields
            .filter((scalarField) => !falsyFieldNames.has(scalarField))
            .join(',')}}`,
        );
      }
    }

    const fieldsSelection = fieldNames
      .filter(
        (fieldName) => !['__scalar', '__name'].includes(fieldName),
      )
      .map((fieldName) => {
        const parsed = parseRequest(fields[fieldName], ctx, [
          ...path,
          fieldName,
        ]);

        if (fieldName.startsWith('on_')) {
          ctx.fragmentCounter++;
          const implementationFragment = `f${ctx.fragmentCounter}`;

          const typeMatch = fieldName.match(/^on_(.+)/);

          if (!typeMatch || !typeMatch[1])
            throw new Error('match failed');

          ctx.fragments.push(
            `fragment ${implementationFragment} on ${typeMatch[1]}${parsed}`,
          );

          return `...${implementationFragment}`;
        } else {
          return `${fieldName}${parsed}`;
        }
      })
      .concat(
        scalarFieldsFragment ? [`...${scalarFieldsFragment}`] : [],
      )
      .join(',');

    return `{${fieldsSelection}}`;
  } else {
    return '';
  }
};

export const generateGraphqlOperation = (
  operation: 'query' | 'mutation' | 'subscription',
  root: LinkedType,
  fields?: Fields,
): GraphqlOperation => {
  const ctx: Context = {
    root: root,
    varCounter: 0,
    variables: {},
    fragmentCounter: 0,
    fragments: [],
  };
  const result = parseRequest(fields, ctx, []);

  const varNames = Object.keys(ctx.variables);

  const varsString =
    varNames.length > 0
      ? `(${varNames.map((varName) => {
            const variableType = ctx.variables[varName].typing[1];
            return `$${varName}:${variableType}`;
          })})`
      : '';

  const operationName = fields?.__name || '';

  return {
    query: [
      `${operation} ${operationName}${varsString}${result}`,
      ...ctx.fragments,
    ].join(','),
    variables: Object.keys(ctx.variables).reduce<{
      [name: string]: unknown;
    }>(
      (result, varName) => {
        result[varName] = ctx.variables[varName].value;
        return result;
      },
      {},
    ),
    ...(operationName
      ? { operationName: operationName.toString() }
      : {}),
  };
};
