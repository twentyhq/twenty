import { type InputSchemaPropertyType } from '@/workflow/types/InputSchema';

export type AiAgentLeaf = {
  isLeaf: true;
  type: InputSchemaPropertyType | undefined;
  label: string;
  value: any;
};

export type AiAgentNode = {
  isLeaf: false;
  type: 'object' | 'unknown';
  label: string;
  value: AiAgentOutputSchema;
};

export type AiAgentOutputSchema = Record<string, AiAgentLeaf | AiAgentNode>;
