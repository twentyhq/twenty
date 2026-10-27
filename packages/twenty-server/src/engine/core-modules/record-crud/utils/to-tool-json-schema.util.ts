import { isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';
import { z } from 'zod';

type JsonSchemaNode = Record<string, unknown>;

const DEFS_REF_PREFIX = '#/$defs/';

const countDefReferences = (
  node: unknown,
  counts: Map<string, number>,
): void => {
  if (Array.isArray(node)) {
    node.forEach((item) => countDefReferences(item, counts));

    return;
  }

  if (!isPlainObject(node)) {
    return;
  }

  const ref = node['$ref'];

  if (isString(ref) && ref.startsWith(DEFS_REF_PREFIX)) {
    const name = ref.slice(DEFS_REF_PREFIX.length);

    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  Object.values(node).forEach((value) => countDefReferences(value, counts));
};

type DefsRewrite = {
  defs: JsonSchemaNode;
  inlinableNames: Set<string>;
  renamedNames: Map<string, string>;
};

const rewriteDefRefs = (node: unknown, rewrite: DefsRewrite): unknown => {
  if (Array.isArray(node)) {
    return node.map((item) => rewriteDefRefs(item, rewrite));
  }

  if (!isPlainObject(node)) {
    return node;
  }

  const { $ref: ref, ...siblings } = node;

  if (isString(ref) && ref.startsWith(DEFS_REF_PREFIX)) {
    const name = ref.slice(DEFS_REF_PREFIX.length);

    if (rewrite.inlinableNames.has(name)) {
      return rewriteDefRefs(
        { ...(rewrite.defs[name] as JsonSchemaNode), ...siblings },
        rewrite,
      );
    }

    return {
      $ref: `${DEFS_REF_PREFIX}${rewrite.renamedNames.get(name) ?? name}`,
      ...(rewriteDefRefs(siblings, rewrite) as JsonSchemaNode),
    };
  }

  return Object.fromEntries(
    Object.entries(node).map(([key, value]) => [
      key,
      rewriteDefRefs(value, rewrite),
    ]),
  );
};

// zod 4.6 hoists the inner schema of `.optional().describe()` into $defs even when used once
const inlineSingleUseDefs = (schema: JsonSchemaNode): JsonSchemaNode => {
  const { $defs: defs, ...rest } = schema;

  if (!isPlainObject(defs)) {
    return schema;
  }

  const counts = new Map<string, number>();

  countDefReferences(schema, counts);

  const inlinableNames = new Set(
    Object.keys(defs).filter((name) => counts.get(name) === 1),
  );

  const remainingNames = Object.keys(defs).filter(
    (name) => !inlinableNames.has(name),
  );

  const rewrite: DefsRewrite = {
    defs,
    inlinableNames,
    renamedNames: new Map(
      remainingNames.map((name, index) => [name, `__schema${index}`]),
    ),
  };

  const inlined = rewriteDefRefs(rest, rewrite) as JsonSchemaNode;

  if (remainingNames.length === 0) {
    return inlined;
  }

  return {
    ...inlined,
    $defs: Object.fromEntries(
      remainingNames.map((name) => [
        rewrite.renamedNames.get(name),
        rewriteDefRefs(defs[name], rewrite),
      ]),
    ),
  };
};

// Converts a Zod schema to a lean JSON Schema for LLM tool optimised consumption.
export const toToolJsonSchema = (schema: z.ZodTypeAny): object => {
  const result = z.toJSONSchema(schema, {
    io: 'input',
    reused: 'ref',
    override(ctx) {
      if (!ctx.jsonSchema) {
        return;
      }

      if (ctx.jsonSchema.type === 'integer') {
        delete ctx.jsonSchema.minimum;
        delete ctx.jsonSchema.maximum;
      }

      if (ctx.jsonSchema.format && ctx.jsonSchema.pattern) {
        delete ctx.jsonSchema.pattern;
      }

      // zod 4.6 emits oneOf for discriminated unions; strict tool-calling providers only accept anyOf
      if (isDefined(ctx.jsonSchema.oneOf)) {
        ctx.jsonSchema.anyOf = ctx.jsonSchema.oneOf;
        delete ctx.jsonSchema.oneOf;
      }
    },
  }) as Record<string, unknown>;

  delete result['$schema'];

  return inlineSingleUseDefs(result);
};
