import { z } from 'zod';

import { OutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';

export const convertOutputSchemaToZod = (
  schema: OutputSchema,
): z.ZodObject<Record<string, z.ZodTypeAny>> => {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const [fieldName, field] of Object.entries(schema)) {
    if (field.isLeaf) {
      let fieldSchema: z.ZodTypeAny;

      switch (field.type) {
        case 'TEXT':
          fieldSchema = z.string();
          break;
        case 'NUMBER':
          fieldSchema = z.number();
          break;
        case 'BOOLEAN':
          fieldSchema = z.boolean();
          break;
        case 'DATE':
          fieldSchema = z.string().describe('Date-time string');
          break;
        default:
          throw new Error(
            `Unsupported field type for AI agent output: ${field.type}`,
          );
      }

      if (field.description) {
        fieldSchema = fieldSchema.describe(field.description);
      }

      shape[fieldName] = fieldSchema;
    }
  }

  return z.object(shape);
};
