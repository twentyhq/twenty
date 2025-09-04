import { type InputSchemaPropertyType } from '@/workflow/types/InputSchema';

export type LeafType = 'string' | 'number' | 'boolean' | 'array' | 'unknown';

export type Leaf = {
  isLeaf: true;
  type: LeafType;
  label: string;
  value: any;
};

export type Node = {
  isLeaf: false;
  type: 'object' | 'unknown';
  label: string;
  value: BaseOutputSchemaV2;
};

export type BaseOutputSchemaV2 = Record<string, Leaf | Node>;

export type LeafDeprecated = {
  isLeaf: true;
  type: InputSchemaPropertyType | undefined;
  label: string;
  value: any;
};

export type BaseOutputSchemaDeprecated = Record<string, LeafDeprecated | Node>;
