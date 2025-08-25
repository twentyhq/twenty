type BaseLeaf = {
  isLeaf: true;
  label: string;
};

type LeafString = BaseLeaf & {
  type: 'string';
  value: string;
};

type LeafNumber = BaseLeaf & {
  type: 'number';
  value: number;
};

type LeafBoolean = BaseLeaf & {
  type: 'boolean';
  value: boolean;
};

type LeafArray = BaseLeaf & {
  type: 'array';
  value: unknown[];
};

type LeafUnknown = BaseLeaf & {
  type: 'unknown';
  value: unknown;
};

type Leaf = LeafString | LeafNumber | LeafBoolean | LeafArray | LeafUnknown;

type Node = {
  isLeaf: false;
  type: 'object' | 'unknown';
  label: string;
  value: BaseOutputSchemaV2;
};

export type BaseOutputSchemaV2 = Record<string, Leaf | Node>;
