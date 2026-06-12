import { type OutputSchemaField } from '@/ai/constants/OutputFieldTypeOptions';
import {
  type AgentResponseFieldType,
  type AgentResponseSchema,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

export const fieldsToSchema = (
  fields: OutputSchemaField[],
): AgentResponseSchema => {
  const properties: Record<
    string,
    { type: AgentResponseFieldType; description?: string }
  > = {};
  const required: string[] = [];

  for (const field of fields) {
    if (!field.name.trim() || !isDefined(field.type)) {
      continue;
    }

    properties[field.name] = {
      type: field.type,
      description: field.description || field.name,
    };
    required.push(field.name);
  }

  return {
    type: 'object' as const,
    properties,
    required,
    additionalProperties: false as const,
  };
};
