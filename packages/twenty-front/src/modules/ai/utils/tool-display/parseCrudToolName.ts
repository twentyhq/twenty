import {
  DATABASE_CRUD_OPERATIONS,
  type DatabaseCrudOperation,
} from 'twenty-shared/ai';

export const parseCrudToolName = (
  toolName: string,
): {
  operation: DatabaseCrudOperation;
  objectSlug: string;
} | null => {
  for (const operation of DATABASE_CRUD_OPERATIONS) {
    const prefix = `${operation}_`;

    if (toolName.startsWith(prefix)) {
      return {
        operation,
        objectSlug: toolName.slice(prefix.length),
      };
    }
  }

  return null;
};
