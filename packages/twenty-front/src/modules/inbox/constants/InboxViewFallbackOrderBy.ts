import { type RecordGqlOperationOrderBy } from 'twenty-shared/types';

export const INBOX_VIEW_FALLBACK_ORDER_BY: RecordGqlOperationOrderBy = [
  { lastActivityAt: 'DescNullsLast' },
];
