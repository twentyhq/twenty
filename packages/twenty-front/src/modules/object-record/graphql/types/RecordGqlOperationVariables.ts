import { RecordGqlOperationFilter } from '@/object-record/graphql/types/RecordGqlOperationFilter';
import { RecordGqlOperationOrderBy } from '@/object-record/graphql/types/RecordGqlOperationOrderBy';
import { QueryCursorDirection } from '@/object-record/utils/generateFindManyRecordsQuery';

export type RecordGqlOperationVariables = {
  filter?: RecordGqlOperationFilter;
  orderBy?: RecordGqlOperationOrderBy;
  limit?: number;
  cursorFilter?: {
    cursor: string;
    cursorDirection: QueryCursorDirection;
    limit: number;
  };
};
