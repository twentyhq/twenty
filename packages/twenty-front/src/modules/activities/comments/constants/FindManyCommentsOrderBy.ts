import { type RecordGqlOperationOrderBy } from '@/object-record/graphql/types/RecordGqlOperationOrderBy';

// Sort comments oldest first (newest at bottom), like Asana
export const FIND_MANY_COMMENTS_ORDER_BY: RecordGqlOperationOrderBy = [
  {
    createdAt: 'AscNullsLast',
  },
];
