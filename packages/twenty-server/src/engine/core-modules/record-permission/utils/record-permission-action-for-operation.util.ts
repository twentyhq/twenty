import { type RecordCapability } from 'twenty-shared/types';

import { type OperationType } from 'src/engine/twenty-orm/repository/permissions.utils';

export const RECORD_CAPABILITY_BY_OPERATION = {
  select: 'read',
  insert: 'create',
  update: 'update',
  delete: 'destroy',
  'soft-delete': 'softDelete',
  restore: 'restore',
} as const satisfies Record<OperationType, RecordCapability>;
