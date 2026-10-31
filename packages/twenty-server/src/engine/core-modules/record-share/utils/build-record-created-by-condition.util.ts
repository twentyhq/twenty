/* @license Enterprise */

import { randomBytes } from 'node:crypto';

import { CREATED_BY_WORKSPACE_MEMBER_ID_COLUMN_NAME } from 'src/engine/core-modules/record-share/constants/private-record-column-names.constant';
import { type SqlCondition } from 'src/engine/twenty-orm/types/row-access-policy.type';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const buildRecordCreatedByCondition = ({
  tableAlias,
  workspaceMemberId,
}: {
  tableAlias: string;
  workspaceMemberId: string;
}): SqlCondition => {
  const parameterName = `recordCreatedByWorkspaceMemberId_${randomBytes(5).toString('hex')}`;

  return {
    sql: `${escapeIdentifier(tableAlias)}.${escapeIdentifier(CREATED_BY_WORKSPACE_MEMBER_ID_COLUMN_NAME)} = :${parameterName}`,
    parameters: { [parameterName]: workspaceMemberId },
  };
};
