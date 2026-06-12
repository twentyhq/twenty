import { type OutputSchemaField } from '@/ai/constants/OutputFieldTypeOptions';
import { type AgentResponseSchema } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

export const schemaToFields = (
  schema: AgentResponseSchema,
): OutputSchemaField[] => {
  if (!isDefined(schema.properties)) return [];

  return Object.entries(schema.properties).map(([key, field]) => ({
    id: v4(),
    name: key,
    description: field.description || '',
    type: field.type,
  }));
};
