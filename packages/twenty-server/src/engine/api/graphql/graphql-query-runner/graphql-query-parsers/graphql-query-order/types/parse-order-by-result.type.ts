import { type OrderByCondition } from './order-by-condition.type';
import { type RelationJoinInfo } from './relation-join-info.type';

export type ParseOrderByResult = {
  orderBy: Record<string, OrderByCondition>;
  relationJoins: RelationJoinInfo[];
};
