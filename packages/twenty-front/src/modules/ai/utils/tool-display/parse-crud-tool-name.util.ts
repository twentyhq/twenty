import { type CrudToolOperation } from '@/ai/constants/crud-tool-operation-verbs.constant';
import { DATABASE_CRUD_OPERATIONS } from 'twenty-shared/ai';

export const parseCrudToolName = (
  toolName: string,
): {
  operation: CrudToolOperation;
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
