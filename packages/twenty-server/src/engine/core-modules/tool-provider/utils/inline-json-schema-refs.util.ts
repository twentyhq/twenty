import { jsonSchema, type ToolSet } from 'ai';
import { type JSONSchema7 } from 'json-schema';

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isPromiseLike = <TValue>(
  value: TValue | PromiseLike<TValue>,
): value is PromiseLike<TValue> =>
  typeof value === 'object' &&
  value !== null &&
  'then' in value &&
  typeof value.then === 'function';

const decodeJsonPointerSegment = (segment: string) =>
  decodeURIComponent(segment).replace(/~1/g, '/').replace(/~0/g, '~');

const resolveLocalJsonPointer = (root: unknown, ref: string): unknown => {
  if (!ref.startsWith('#/')) {
    return undefined;
  }

  return ref
    .slice(2)
    .split('/')
    .map(decodeJsonPointerSegment)
    .reduce<unknown>((current, pathSegment) => {
      if (!isPlainObject(current)) {
        return undefined;
      }

      return current[pathSegment];
    }, root);
};

export const inlineJsonSchemaRefs = <TSchema extends JSONSchema7>(
  schema: TSchema,
): TSchema => {
  const inlineValue = (
    value: unknown,
    root: unknown,
    refStack: string[],
  ): unknown => {
    if (Array.isArray(value)) {
      return value.map((item) => inlineValue(item, root, refStack));
    }

    if (!isPlainObject(value)) {
      return value;
    }

    const ref = typeof value.$ref === 'string' ? value.$ref : undefined;

    if (ref) {
      if (refStack.includes(ref)) {
        throw new Error(`Circular JSON Schema reference detected: ${ref}`);
      }

      const referencedSchema = resolveLocalJsonPointer(root, ref);

      if (referencedSchema === undefined) {
        throw new Error(`Unable to resolve JSON Schema reference: ${ref}`);
      }

      const { $ref: _ref, ...refSiblings } = value;
      const inlinedReference = inlineValue(referencedSchema, root, [
        ...refStack,
        ref,
      ]);

      return inlineValue(
        {
          ...(isPlainObject(inlinedReference) ? inlinedReference : {}),
          ...refSiblings,
        },
        root,
        refStack,
      );
    }

    return Object.entries(value).reduce<Record<string, unknown>>(
      (acc, [key, entryValue]) => {
        if (key === '$defs' || key === 'definitions') {
          return acc;
        }

        acc[key] = inlineValue(entryValue, root, refStack);

        return acc;
      },
      {},
    );
  };

  return inlineValue(schema, schema, []) as TSchema;
};

export const inlineToolSetInputSchemaRefs = (toolSet: ToolSet): ToolSet =>
  Object.fromEntries(
    Object.entries(toolSet).map(([toolName, tool]) => {
      const inputSchema = tool.inputSchema;

      if (!isPlainObject(inputSchema) || !('jsonSchema' in inputSchema)) {
        return [toolName, tool];
      }

      const schema = inputSchema as {
        readonly jsonSchema: JSONSchema7 | PromiseLike<JSONSchema7>;
        readonly validate?: (value: unknown) => unknown;
      };
      const toolJsonSchema = schema.jsonSchema;

      if (isPromiseLike(toolJsonSchema)) {
        return [toolName, tool];
      }

      return [
        toolName,
        {
          ...tool,
          inputSchema: jsonSchema(
            inlineJsonSchemaRefs(toolJsonSchema),
            schema.validate
              ? { validate: schema.validate as never }
              : undefined,
          ),
        },
      ];
    }),
  ) as ToolSet;
