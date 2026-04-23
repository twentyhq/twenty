export type WorkspaceSchemaColumnDefinition = {
  name: string;
  type: string;
  isNullable?: boolean;
  default?: string | number | boolean | null;
  isPrimary?: boolean;
  isUnique?: boolean;
  isArray?: boolean;
  asExpression?: string;
  generatedType?: 'STORED' | 'VIRTUAL';
};
