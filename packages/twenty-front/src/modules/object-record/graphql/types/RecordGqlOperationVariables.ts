import { type RecordGqlOperationOrderBy } from '@/object-record/graphql/types/RecordGqlOperationOrderBy';
import { type QueryCursorDirection } from '@/object-record/utils/generateFindManyRecordsQuery';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

export type RecordGqlOperationVariables = {
  filter?: RecordGqlOperationFilter;
  orderBy?: RecordGqlOperationOrderBy;
  limit?: number;
  cursorFilter?: {
    cursor: string;
    cursorDirection: QueryCursorDirection;
  };
};
