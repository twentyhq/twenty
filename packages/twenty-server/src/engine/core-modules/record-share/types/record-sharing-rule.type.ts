/* @license Enterprise */

import { type RecordShareAccessLevel } from 'twenty-shared/types';

import { type RowAccessRecord } from 'src/engine/core-modules/record-share/types/row-access-record.type';
import { type SqlCondition } from 'src/engine/twenty-orm/types/row-access-policy.type';

export type ExecuteRawQuery = (
  sql: string,
  parameters: Record<string, unknown>,
) => Promise<Record<string, unknown>[]>;

// A grant that follows from the record's data rather than a stored share row
export type RecordSharingRule = {
  objectUniversalIdentifier: string;
  principalId: string;
  accessLevel: RecordShareAccessLevel;
  buildCondition: (args: {
    tableAlias: string;
    workspaceId: string;
  }) => SqlCondition;
  resolveMatchingRecordIds: (args: {
    records: RowAccessRecord[];
    workspaceId: string;
    executeRawQuery: ExecuteRawQuery;
  }) => Promise<Set<string>>;
};
