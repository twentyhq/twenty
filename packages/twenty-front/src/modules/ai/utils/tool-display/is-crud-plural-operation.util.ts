import { type CrudToolOperation } from '@/ai/constants/crud-tool-operation-verbs.constant';

export const isCrudPluralOperation = (operation: CrudToolOperation): boolean =>
  operation.endsWith('_many') || operation === 'group_by';
