import { type BaseOutputSchemaV2 } from 'twenty-shared/workflow';

export type AgentResponseFormat =
  | { type: 'text' }
  | {
      type: 'json';
      schema: BaseOutputSchemaV2;
    };
