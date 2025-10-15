import { type ObjectRecord } from 'twenty-shared/types';

export interface QueryResultGetterHandlerInterface {
  handle(
    objectRecord: ObjectRecord,
    workspaceId: string,
  ): Promise<ObjectRecord>;
}
