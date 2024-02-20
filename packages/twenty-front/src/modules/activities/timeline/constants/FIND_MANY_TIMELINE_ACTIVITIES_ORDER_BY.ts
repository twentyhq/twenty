import { OrderByField } from '@/object-metadata/types/OrderByField';

export const FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY: OrderByField = {
  createdAt: 'DescNullsFirst',
};
