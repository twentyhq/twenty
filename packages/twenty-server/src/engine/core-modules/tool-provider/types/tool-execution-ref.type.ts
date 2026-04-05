import { type DatabaseCrudOperation } from 'src/engine/core-modules/tool-provider/types/database-crud-operation.type';

export type ToolExecutionRef =
  | {
      kind: 'database_crud';
      objectNameSingular: string;
      operation: DatabaseCrudOperation;
    }
  | { kind: 'static'; toolId: string }
  | { kind: 'logic_function'; logicFunctionId: string };
