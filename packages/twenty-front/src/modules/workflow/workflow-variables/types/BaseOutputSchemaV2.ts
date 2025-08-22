type PrimitiveLeaf = {
  isLeaf: true;
  type: 'string' | 'number' | 'boolean' | 'array' | 'unknown';
  label: string;
  value: any;
};

type PrimitiveNode = {
  isLeaf: false;
  type: 'object' | 'unknown';
  label: string;
  value: BaseOutputSchemaV2;
};

export type PrimitiveOutputSchema = Record<
  string,
  PrimitiveLeaf | PrimitiveNode
>;

export type BaseOutputSchemaV2 = Record<string, PrimitiveLeaf | PrimitiveNode>;
