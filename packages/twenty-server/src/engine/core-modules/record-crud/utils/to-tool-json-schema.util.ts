import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

// Zod schemas are immutable and static tool schemas are module-level constants, so a
// conversion done once stays valid for the process lifetime.
const jsonSchemaByZodSchema = new WeakMap<z.ZodTypeAny, object>();

export const toToolJsonSchema = (schema: z.ZodTypeAny): object => {
  const cachedJsonSchema = jsonSchemaByZodSchema.get(schema);

  if (isDefined(cachedJsonSchema)) {
    return cachedJsonSchema;
  }

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
    },
  }) as Record<string, unknown>;

  delete result['$schema'];

  jsonSchemaByZodSchema.set(schema, result);

  return result;
};
