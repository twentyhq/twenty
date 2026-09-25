import { isNonEmptyString } from '@sniptt/guards';
import {
  type QueryCursorDirection,
  type RecordGqlOperationFilter,
  type RecordGqlOperationOrderBy,
  type RecordGqlOperationVariables,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeCursorArgFilter } from '@/object-record/graphql/utils/computeCursorArgFilter';

type NeighborQueryArgs = {
  orderBy: RecordGqlOperationOrderBy;
  keysetFilter: RecordGqlOperationFilter | undefined;
  cursorFilter: RecordGqlOperationVariables['cursorFilter'];
};

type RecordShowNeighborQueryArgs = {
  hasNeighborQueryArgs: boolean;
  skipNeighborQueries: boolean;
  before: NeighborQueryArgs;
  after: NeighborQueryArgs;
};

export const computeRecordShowNeighborQueryArgs = ({
  orderBy,
  currentRecordKeysetValues,
  currentRecordCursor,
  isLoadingCurrentRecord,
}: {
  orderBy: RecordGqlOperationOrderBy;
  currentRecordKeysetValues: Record<string, unknown> | undefined;
  currentRecordCursor: string | null | undefined;
  isLoadingCurrentRecord: boolean;
}): RecordShowNeighborQueryArgs => {
  if (
    !isDefined(currentRecordKeysetValues) ||
    !isNonEmptyString(currentRecordCursor)
  ) {
    const emptyNeighborQueryArgs: NeighborQueryArgs = {
      orderBy,
      keysetFilter: undefined,
      cursorFilter: undefined,
    };

    return {
      hasNeighborQueryArgs: false,
      skipNeighborQueries: true,
      before: emptyNeighborQueryArgs,
      after: emptyNeighborQueryArgs,
    };
  }

  const buildNeighborQueryArgs = (
    cursorDirection: QueryCursorDirection,
  ): NeighborQueryArgs => ({
    orderBy,
    keysetFilter: computeCursorArgFilter({
      orderBy,
      cursorRecordValues: currentRecordKeysetValues,
      isForwardPagination: cursorDirection === 'after',
    }),
    cursorFilter: { cursor: currentRecordCursor, cursorDirection },
  });

  return {
    hasNeighborQueryArgs: true,
    skipNeighborQueries: isLoadingCurrentRecord,
    before: buildNeighborQueryArgs('before'),
    after: buildNeighborQueryArgs('after'),
  };
};
