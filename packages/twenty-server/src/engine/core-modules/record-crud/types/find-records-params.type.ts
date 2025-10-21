import {
  type ObjectRecordFilter,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

export type FindRecordsParams = {
  objectName: string;
  filter?:
    | Record<string, unknown>
    | Record<string, unknown>[]
    | Partial<ObjectRecordFilter>
    | Partial<ObjectRecordFilter>[];
  orderBy?: Partial<ObjectRecordOrderBy>;
  limit?: number;
  offset?: number;
  workspaceId: string;
  rolePermissionConfig?: RolePermissionConfig;
};
