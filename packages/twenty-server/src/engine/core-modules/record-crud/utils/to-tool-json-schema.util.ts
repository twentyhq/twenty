import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

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

      if (isDefined(ctx.jsonSchema.oneOf)) {
        ctx.jsonSchema.anyOf = ctx.jsonSchema.oneOf;
        delete ctx.jsonSchema.oneOf;
      }
    },
  }) as Record<string, unknown>;

  delete result['$schema'];

  return result;
};
