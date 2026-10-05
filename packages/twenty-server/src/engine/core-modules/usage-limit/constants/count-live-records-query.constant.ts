export const COUNT_LIVE_RECORDS_QUERY = `
  SELECT COALESCE(SUM(n_live_tup), 0)::bigint AS quantity
  FROM pg_stat_user_tables
  WHERE schemaname = $1 AND relname = ANY($2)
`;
