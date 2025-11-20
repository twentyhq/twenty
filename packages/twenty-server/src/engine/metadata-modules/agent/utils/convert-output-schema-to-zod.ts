import { z } from 'zod';
import { type AgentResponseSchema } from 'twenty-shared/ai';
import { FieldMetadataType } from 'twenty-shared/types';

export const convertAgentSchemaToZod = (
  schema: AgentResponseSchema,
): z.ZodObject<Record<string, z.ZodTypeAny>> => {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const [fieldName, fieldConfig] of Object.entries(schema)) {
    let fieldSchema: z.ZodTypeAny;

    switch (fieldConfig.type) {
      case FieldMetadataType.TEXT:
        fieldSchema = z.string();
        break;
      case FieldMetadataType.NUMBER:
      case FieldMetadataType.NUMERIC:
        fieldSchema = z.number();
        break;
      case FieldMetadataType.BOOLEAN:
        fieldSchema = z.boolean();
        break;
      case FieldMetadataType.DATE:
      case FieldMetadataType.DATE_TIME:
        fieldSchema = z.string().describe('Date-time string');
        break;
      default:
        throw new Error(
          `Unsupported field type for AI agent output: ${fieldConfig.type}`,
        );
    }

    if (fieldConfig.description) {
      fieldSchema = fieldSchema.describe(fieldConfig.description);
    }

    shape[fieldName] = fieldSchema;
  }

  return z.object(shape);
};
