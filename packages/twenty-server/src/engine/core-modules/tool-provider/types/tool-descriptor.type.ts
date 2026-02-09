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

// Fully JSON-serializable tool definition, stored in Redis
export type ToolDescriptor = {
  name: string;
  description: string;
  category: ToolCategory;
  inputSchema: object;
  executionRef: ToolExecutionRef;
  objectName?: string;
  operation?: string;
};
