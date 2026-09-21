import chunk from 'lodash.chunk';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { type GroupByDefinition } from 'src/engine/api/common/common-query-runners/types/group-by-definition.type';
import { JSONB_BUILD_OBJECT_MAX_PAIRS } from 'src/engine/api/graphql/graphql-query-runner/group-by/services/group-by-with-records.constants';
import {
  escapeIdentifier,
  escapeLiteral,
} from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

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
