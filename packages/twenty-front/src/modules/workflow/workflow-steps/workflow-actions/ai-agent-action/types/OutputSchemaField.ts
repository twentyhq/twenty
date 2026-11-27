import { type AgentResponseFieldType } from 'twenty-shared/ai';

export type OutputSchemaField = {
  id: string;
  name: string;
  description?: string;
  type: AgentResponseFieldType | undefined;
};
