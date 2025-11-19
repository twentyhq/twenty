import { type OutputSchema } from 'src/modules/workflow/workflow-builder/workflow-schema/types/output-schema.type';

export type AgentResponseFormatType = 'text' | 'json';

export type AgentResponseFormat =
  | { type: 'text' }
  | {
      type: 'json';
      schema: OutputSchema;
    };

