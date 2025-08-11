import { type ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { type IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';

export type QueryResultFieldValue =
  | IConnection<ObjectRecord>
  | IConnection<ObjectRecord>[]
  | { records: ObjectRecord[] }
  | ObjectRecord
  | ObjectRecord[];
