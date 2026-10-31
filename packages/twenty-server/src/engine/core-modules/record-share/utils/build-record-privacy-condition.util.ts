/* @license Enterprise */

import { IS_PRIVATE_COLUMN_NAME } from 'src/engine/core-modules/record-share/constants/private-record-column-names.constant';
import { type SqlCondition } from 'src/engine/twenty-orm/types/row-access-policy.type';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const buildRecordPrivacyCondition = ({
  tableAlias,
  isPrivate,
}: {
  tableAlias: string;
  isPrivate: boolean;
}): SqlCondition => ({
  sql: `${escapeIdentifier(tableAlias)}.${escapeIdentifier(IS_PRIVATE_COLUMN_NAME)} = ${isPrivate ? 'TRUE' : 'FALSE'}`,
  parameters: {},
});
