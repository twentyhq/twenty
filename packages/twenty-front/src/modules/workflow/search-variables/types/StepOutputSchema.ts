import { InputSchemaPropertyType } from '@/workflow/types/InputSchema';

export type Leaf = {
  isLeaf: true;
  type?: InputSchemaPropertyType;
  icon?: string;
  label?: string;
  value: any;
};

export type Node = {
  isLeaf: false;
  icon?: string;
  label?: string;
  value: Record<string, Leaf | Node>;
};

export type BaseOutputSchema = {
  fields: Record<string, Leaf | Node>;
};

export type RecordOutputSchema = {
  object: { nameSingular: string; fieldIdName: string } & Leaf;
  fields: Record<string, Leaf | Node>;
};

export type OutputSchema = BaseOutputSchema | RecordOutputSchema;

export type StepOutputSchema = {
  id: string;
  name: string;
  outputSchema: OutputSchema;
};
