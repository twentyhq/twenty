import { DATABASE_CRUD_OPERATIONS } from 'src/engine/core-modules/tool-provider/constants/database-crud-operation.const';

export const getToolMetricName = (toolName: string): string => {
  const operation = DATABASE_CRUD_OPERATIONS.find(
    (crudOperation) =>
      toolName === crudOperation || toolName.startsWith(`${crudOperation}_`),
  );

  return operation ?? toolName;
};
