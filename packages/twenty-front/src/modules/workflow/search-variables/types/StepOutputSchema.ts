import { InputSchemaPropertyType } from '@/workflow/types/InputSchema';

type Leaf = {
  isLeaf: true;
  type?: InputSchemaPropertyType;
  icon?: string;
  value: any;
};

type Node = {
  isLeaf: false;
  icon?: string;
  value: OutputSchema;
};

export type OutputSchema = Record<string, Leaf | Node>;

export type StepOutputSchema = {
  id: string;
  name: string;
  outputSchema: OutputSchema;
};
