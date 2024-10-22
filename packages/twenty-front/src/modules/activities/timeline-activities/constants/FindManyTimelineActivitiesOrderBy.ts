import { RecordGqlOperationOrderBy } from '@/object-record/graphql/types/RecordGqlOperationOrderBy';

export const FIND_MANY_TIMELINE_ACTIVITIES_ORDER_BY: RecordGqlOperationOrderBy =
  [
    {
      createdAt: 'DescNullsFirst',
    },
  ];
