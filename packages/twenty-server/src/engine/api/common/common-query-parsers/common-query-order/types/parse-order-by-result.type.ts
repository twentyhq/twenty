import { type OrderByClause } from './order-by-condition.type';
import { type RelationJoinInfo } from './relation-join-info.type';

export type ParseOrderByResult = {
  orderBy: Record<string, OrderByClause>;
  relationJoins: RelationJoinInfo[];
};
