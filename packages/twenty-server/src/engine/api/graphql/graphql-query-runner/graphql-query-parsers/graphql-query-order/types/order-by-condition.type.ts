export type OrderByClause = {
  order: 'ASC' | 'DESC';
  nulls?: 'NULLS FIRST' | 'NULLS LAST';
  useLower?: boolean;
};
