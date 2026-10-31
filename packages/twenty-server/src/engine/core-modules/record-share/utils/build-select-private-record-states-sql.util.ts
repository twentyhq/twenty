/* @license Enterprise */

import {
  CREATED_BY_WORKSPACE_MEMBER_ID_COLUMN_NAME,
  IS_PRIVATE_COLUMN_NAME,
} from 'src/engine/core-modules/record-share/constants/private-record-column-names.constant';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const buildSelectPrivateRecordStatesSql = ({
  tableExpression,
  hasCreatedByField,
}: {
  tableExpression: string;
  hasCreatedByField: boolean;
}): string =>
  `SELECT "id", ${escapeIdentifier(IS_PRIVATE_COLUMN_NAME)} AS "isPrivate", ${
    hasCreatedByField
      ? escapeIdentifier(CREATED_BY_WORKSPACE_MEMBER_ID_COLUMN_NAME)
      : 'NULL'
  } AS "createdByWorkspaceMemberId" FROM ${tableExpression} WHERE "id" = ANY(:recordIds)`;
