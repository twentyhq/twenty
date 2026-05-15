import { type DataSource } from 'typeorm';

import {
  ANY_V2_ENVELOPE_LIKE_PATTERN,
  buildPrimaryKeyIdEnvelopeLikePattern,
} from 'src/database/commands/secret-encryption-rotation/utils/build-non-current-keyid-like-pattern.util';

export const countNonCurrentKeyIdRows = async ({
  dataSource,
  schema,
  table,
  columns,
  primaryKeyId,
  extraWhereClause,
}: {
  dataSource: DataSource;
  schema: string;
  table: string;
  columns: string[];
  primaryKeyId: string;
  extraWhereClause?: string;
}): Promise<number> => {
  const primaryPattern = buildPrimaryKeyIdEnvelopeLikePattern(primaryKeyId);
  const extraWhere = extraWhereClause ? ` AND ${extraWhereClause}` : '';

  const orClauses = columns
    .map((column) => `("${column}" LIKE $1 AND "${column}" NOT LIKE $2)`)
    .join(' OR ');

  const rows: { count: string }[] = await dataSource.query(
    `SELECT COUNT(*)::bigint AS count
       FROM "${schema}"."${table}"
      WHERE (${orClauses})
        ${extraWhere}`,
    [ANY_V2_ENVELOPE_LIKE_PATTERN, primaryPattern],
  );

  return Number(rows[0]?.count ?? 0);
};
