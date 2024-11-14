import { Record as ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';

export type QueryResultFieldValue =
  | IConnection<ObjectRecord>
  | { records: ObjectRecord[] }
  | ObjectRecord
  | ObjectRecord[];
