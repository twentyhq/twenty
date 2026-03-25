import { type ToolCategory } from 'src/engine/core-modules/tool-provider/enums/tool-category.enum';

export type DatabaseCrudOperation =
  | 'find'
  | 'find_one'
  | 'create'
  | 'create_many'
  | 'update'
  | 'update_many'
  | 'delete';

export type ToolExecutionRef =
  | {
      kind: 'database_crud';
      objectNameSingular: string;
      operation: DatabaseCrudOperation;
    }
  | { kind: 'static'; toolId: string }
  | { kind: 'logic_function'; logicFunctionId: string };

// Lightweight entry for catalog/index (no schema)
export type ToolIndexEntry = {
  name: string;
  description: string;
  category: ToolCategory;
  executionRef: ToolExecutionRef;
  objectName?: string;
  operation?: string;
};

// Full descriptor with schema (on-demand)
export type ToolDescriptor = ToolIndexEntry & {
  inputSchema: object;
};
