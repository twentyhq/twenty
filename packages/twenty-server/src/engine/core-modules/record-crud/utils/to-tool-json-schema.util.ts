import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { inlineSingleUseJsonSchemaDefs } from 'src/engine/core-modules/record-crud/utils/inline-single-use-json-schema-defs.util';

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

  return inlineSingleUseJsonSchemaDefs(result);
};
