import { type AgentResponseSchema } from 'twenty-shared/ai';

export type AgentResponseFormatType = 'text' | 'json';

export type AgentResponseFormat =
  | { type: 'text' }
  | {
      type: 'json';
      schema: AgentResponseSchema;
    };
