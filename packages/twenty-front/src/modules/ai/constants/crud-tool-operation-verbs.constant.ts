import { msg } from '@lingui/core/macro';
import { type DatabaseCrudOperation } from 'twenty-shared/ai';

import { type ToolStatusLabels } from '@/ai/types/tool-status-labels.type';

export type CrudToolOperation = DatabaseCrudOperation;

export const isCrudPluralOperation = (
  operation: CrudToolOperation,
): boolean => operation.endsWith('_many') || operation === 'group_by';

export const CRUD_TOOL_OPERATION_VERBS: Record<
  CrudToolOperation,
  ToolStatusLabels
> = {
  find_many: {
    loading: msg`Searching {objectLabel}`,
    completed: msg`Searched {objectLabel}`,
  },
  find_one: {
    loading: msg`Finding {objectLabel}`,
    completed: msg`Found {objectLabel}`,
  },
  group_by: {
    loading: msg`Grouping {objectLabel}`,
    completed: msg`Grouped {objectLabel}`,
  },
  create_one: {
    loading: msg`Creating {objectLabel}`,
    completed: msg`Created {objectLabel}`,
  },
  create_many: {
    loading: msg`Creating {objectLabel}`,
    completed: msg`Created {objectLabel}`,
  },
  update_one: {
    loading: msg`Updating {objectLabel}`,
    completed: msg`Updated {objectLabel}`,
  },
  update_many: {
    loading: msg`Updating {objectLabel}`,
    completed: msg`Updated {objectLabel}`,
  },
  upsert_many: {
    loading: msg`Upserting {objectLabel}`,
    completed: msg`Upserted {objectLabel}`,
  },
  delete_one: {
    loading: msg`Deleting {objectLabel}`,
    completed: msg`Deleted {objectLabel}`,
  },
  delete_many: {
    loading: msg`Deleting {objectLabel}`,
    completed: msg`Deleted {objectLabel}`,
  },
};
