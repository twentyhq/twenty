import { type AgentResponseSchema } from 'twenty-shared/ai';

export const buildStrictAgentResponseSchema = (
  schema: AgentResponseSchema,
): AgentResponseSchema => ({
  ...schema,
  required: Object.keys(schema.properties),
  additionalProperties: false,
});
