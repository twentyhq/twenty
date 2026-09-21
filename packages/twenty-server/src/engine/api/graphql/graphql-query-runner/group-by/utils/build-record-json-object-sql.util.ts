import chunk from 'lodash.chunk';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { type GroupByDefinition } from 'src/engine/api/common/common-query-runners/types/group-by-definition.type';
import {
  escapeIdentifier,
  escapeLiteral,
} from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const POSTGRES_FUNCTION_MAX_ARGUMENTS = 100;
const JSONB_BUILD_OBJECT_MAX_PAIRS = POSTGRES_FUNCTION_MAX_ARGUMENTS / 2;

// Keys stay SQL literals rather than column aliases: PostgreSQL truncates
// identifiers at 63 bytes, and a composite or join column name can exceed that.
export const buildRecordJsonObjectSql = ({
  subQueryAliasByColumnName,
  groupByDefinitions,
}: {
  subQueryAliasByColumnName: Record<string, string>;
  groupByDefinitions: GroupByDefinition[];
}): string => {
  const keyValueEntries = [
    ...Object.entries(subQueryAliasByColumnName).map(
      ([columnName, subQueryAlias]) =>
        `${escapeLiteral(columnName)}, ${escapeIdentifier(subQueryAlias)}`,
    ),
    ...groupByDefinitions.map(
      (groupByDefinition) =>
        `${escapeLiteral(groupByDefinition.alias)}, ${escapeIdentifier(
          groupByDefinition.alias,
        )}`,
    ),
  ];

  if (!isNonEmptyArray(keyValueEntries)) {
    return 'JSONB_BUILD_OBJECT()';
  }

  return chunk(keyValueEntries, JSONB_BUILD_OBJECT_MAX_PAIRS)
    .map((entries) => `JSONB_BUILD_OBJECT(${entries.join(', ')})`)
    .join(' || ');
};
