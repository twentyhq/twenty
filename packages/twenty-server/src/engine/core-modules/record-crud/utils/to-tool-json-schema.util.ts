import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

// Converts a Zod schema to a lean JSON Schema for LLM tool optimised consumption.
export const toToolJsonSchema = (schema: z.ZodTypeAny): object => {
  const result = z.toJSONSchema(schema, {
    io: 'input',
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

      // Since zod 4.4, discriminated unions emit oneOf; strict tool-calling providers only accept anyOf
      if (isDefined(ctx.jsonSchema.oneOf)) {
        ctx.jsonSchema.anyOf = ctx.jsonSchema.oneOf;
        delete ctx.jsonSchema.oneOf;
      }
    },
  }) as Record<string, unknown>;

  delete result['$schema'];

  return result;
};
