export type OrderByCondition = {
  order: 'ASC' | 'DESC';
  nulls?: 'NULLS FIRST' | 'NULLS LAST';
};

export type RelationJoinInfo = {
  joinAlias: string;
};

export type ParseOrderByResult = {
  orderBy: Record<string, OrderByCondition>;
  relationJoins: RelationJoinInfo[];
};
