import { type ObjectRecord } from 'twenty-shared/types';

import { type IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';

export type QueryResultFieldValue =
  | IConnection<ObjectRecord>
  | IConnection<ObjectRecord>[]
  | { records: ObjectRecord[] }
  | ObjectRecord
  | ObjectRecord[];
