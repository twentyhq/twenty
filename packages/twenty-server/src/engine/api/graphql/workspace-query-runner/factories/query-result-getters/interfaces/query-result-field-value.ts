import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';

export type QueryResultFieldValue =
  | IConnection<ObjectRecord>
  | IConnection<ObjectRecord>[]
  | { records: ObjectRecord[] }
  | ObjectRecord
  | ObjectRecord[];
