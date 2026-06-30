import { z } from 'zod';

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
    },
  }) as Record<string, unknown>;

  delete result['$schema'];

  return result;
};
