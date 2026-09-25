import { type RecordGqlOperationOrderBy } from 'twenty-shared/types';

import { computeRecordShowNeighborQueryArgs } from '@/object-record/record-show/utils/computeRecordShowNeighborQueryArgs';

const ORDER_BY: RecordGqlOperationOrderBy = [{ name: 'AscNullsLast' }];

const CURRENT_RECORD_CURSOR = 'encoded-cursor';

const CURRENT_RECORD_KEYSET_VALUES = { id: 'record-1', name: 'Ada' };

describe('computeRecordShowNeighborQueryArgs', () => {
  it('should ask the server for both neighbours with the current record cursor', () => {
    const { before, after, hasNeighborQueryArgs, skipNeighborQueries } =
      computeRecordShowNeighborQueryArgs({
        orderBy: ORDER_BY,
        currentRecordKeysetValues: CURRENT_RECORD_KEYSET_VALUES,
        currentRecordCursor: CURRENT_RECORD_CURSOR,
        isLoadingCurrentRecord: false,
      });

    expect(hasNeighborQueryArgs).toBe(true);
    expect(skipNeighborQueries).toBe(false);
    expect(before.cursorFilter).toEqual({
      cursor: CURRENT_RECORD_CURSOR,
      cursorDirection: 'before',
    });
    expect(after.cursorFilter).toEqual({
      cursor: CURRENT_RECORD_CURSOR,
      cursorDirection: 'after',
    });
  });

  it('should scan backward through the cursor direction rather than a reversed ordering', () => {
    const { before, after } = computeRecordShowNeighborQueryArgs({
      orderBy: ORDER_BY,
      currentRecordKeysetValues: CURRENT_RECORD_KEYSET_VALUES,
      currentRecordCursor: CURRENT_RECORD_CURSOR,
      isLoadingCurrentRecord: false,
    });

    expect(before.orderBy).toEqual(ORDER_BY);
    expect(after.orderBy).toEqual(ORDER_BY);
  });

  it('should continue the keyset scan backward before the record and forward after it', () => {
    const { before, after } = computeRecordShowNeighborQueryArgs({
      orderBy: ORDER_BY,
      currentRecordKeysetValues: CURRENT_RECORD_KEYSET_VALUES,
      currentRecordCursor: CURRENT_RECORD_CURSOR,
      isLoadingCurrentRecord: false,
    });

    expect(before.keysetFilter).toEqual({
      or: [
        { name: { lt: 'Ada' } },
        { and: [{ name: { eq: 'Ada' } }, { id: { lt: 'record-1' } }] },
      ],
    });
    expect(after.keysetFilter).toEqual({
      or: [
        { or: [{ name: { gt: 'Ada' } }, { name: { is: 'NULL' } }] },
        { and: [{ name: { eq: 'Ada' } }, { id: { gt: 'record-1' } }] },
      ],
    });
  });

  it('should skip the neighbour queries while the current record cursor is missing', () => {
    const { before, after, hasNeighborQueryArgs, skipNeighborQueries } =
      computeRecordShowNeighborQueryArgs({
        orderBy: ORDER_BY,
        currentRecordKeysetValues: CURRENT_RECORD_KEYSET_VALUES,
        currentRecordCursor: undefined,
        isLoadingCurrentRecord: false,
      });

    expect(hasNeighborQueryArgs).toBe(false);
    expect(skipNeighborQueries).toBe(true);
    expect(before).toEqual({
      orderBy: ORDER_BY,
      keysetFilter: undefined,
      cursorFilter: undefined,
    });
    expect(after).toEqual({
      orderBy: ORDER_BY,
      keysetFilter: undefined,
      cursorFilter: undefined,
    });
  });

  it('should skip the neighbour queries while the current record is loading', () => {
    const { skipNeighborQueries, hasNeighborQueryArgs } =
      computeRecordShowNeighborQueryArgs({
        orderBy: ORDER_BY,
        currentRecordKeysetValues: CURRENT_RECORD_KEYSET_VALUES,
        currentRecordCursor: CURRENT_RECORD_CURSOR,
        isLoadingCurrentRecord: true,
      });

    expect(hasNeighborQueryArgs).toBe(true);
    expect(skipNeighborQueries).toBe(true);
  });
});
