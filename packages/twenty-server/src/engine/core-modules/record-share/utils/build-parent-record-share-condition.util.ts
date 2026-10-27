/* @license Enterprise */

import { type RecordShareAccessLevel } from 'twenty-shared/types';

import { buildRecordShareCondition } from 'src/engine/core-modules/record-share/utils/build-record-share-condition.util';
import { type SqlCondition } from 'src/engine/twenty-orm/types/row-access-policy.type';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

// A record pointing to no parent exposes no private record
export const buildParentRecordShareCondition = ({
  tableAlias,
  joinColumnName,
  recordShareTableExpression,
  objectMetadataId,
  principalIds,
  accessLevels,
}: {
  tableAlias: string;
  joinColumnName: string;
  recordShareTableExpression: string;
  objectMetadataId: string;
  principalIds: string[];
  accessLevels: RecordShareAccessLevel[];
}): SqlCondition => {
  const parentRecordShareCondition = buildRecordShareCondition({
    tableAlias,
    recordShareTableExpression,
    objectMetadataId,
    principalIds,
    accessLevels,
    recordIdColumnName: joinColumnName,
  });

  return {
    sql: `(${escapeIdentifier(tableAlias)}.${escapeIdentifier(joinColumnName)} IS NULL OR ${parentRecordShareCondition.sql})`,
    parameters: parentRecordShareCondition.parameters,
  };
};
