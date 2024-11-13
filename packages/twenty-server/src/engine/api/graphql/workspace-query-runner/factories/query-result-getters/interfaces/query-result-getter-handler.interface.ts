import { Record as ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';

export interface QueryResultGetterHandlerInterface {
  handle(
    objectRecord: ObjectRecord,
    workspaceId: string,
  ): Promise<ObjectRecord>;
}
