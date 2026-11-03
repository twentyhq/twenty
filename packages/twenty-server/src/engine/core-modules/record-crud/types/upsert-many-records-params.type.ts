import { type ActorMetadata } from 'twenty-shared/types';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type ObjectRecordProperties } from 'src/engine/core-modules/record-crud/types/object-record-properties.type';

export type UpsertManyRecordsParams = {
  objectName: string;
  objectRecords: ObjectRecordProperties[];
  authContext: WorkspaceAuthContext;
  createdBy?: ActorMetadata;
  slimResponse?: boolean;
};
