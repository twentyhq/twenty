import { ObjectRecord } from 'twenty-shared';

export interface QueryResultGetterHandlerInterface {
  handle(
    objectRecord: ObjectRecord,
    workspaceId: string,
  ): Promise<ObjectRecord>;
}
