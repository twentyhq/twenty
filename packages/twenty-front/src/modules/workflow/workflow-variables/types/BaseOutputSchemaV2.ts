type BaseLeafType = 'string' | 'number' | 'boolean' | 'array' | 'unknown';

type BaseLeaf = {
  isLeaf: true;
  type: BaseLeafType;
  label: string;
  value: any;
};

type BaseNode = {
  isLeaf: false;
  type: 'object' | 'unknown';
  label: string;
  value: BaseOutputSchemaV2;
};

export type BaseOutputSchemaV2 = Record<string, BaseLeaf | BaseNode>;
