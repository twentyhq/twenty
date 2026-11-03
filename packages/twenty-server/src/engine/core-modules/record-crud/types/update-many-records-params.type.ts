import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type ObjectRecordProperties } from 'src/engine/core-modules/record-crud/types/object-record-properties.type';

export type UpdateManyRecordsParams = {
  objectName: string;
  filter: Partial<ObjectRecordFilter>;
  data: ObjectRecordProperties;
  authContext: WorkspaceAuthContext;
  slimResponse?: boolean;
};
