export type OrderByClause = {
  order: 'ASC' | 'DESC';
  nulls?: 'NULLS FIRST' | 'NULLS LAST';
  useLower?: boolean;
  castToText?: boolean; // For SELECT/MULTI_SELECT fields that need ::text before LOWER
};
