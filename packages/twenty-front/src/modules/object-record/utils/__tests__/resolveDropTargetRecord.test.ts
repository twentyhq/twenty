import { resolveDropTargetRecord } from '@/object-record/utils/resolveDropTargetRecord';

const records = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

describe('resolveDropTargetRecord', () => {
  it('returns the record at toIndex when dropped inside the list', () => {
    expect(resolveDropTargetRecord({ records, toIndex: 1 })).toEqual({
      targetRecord: { id: 'b' },
      isDroppedAfterList: false,
    });
  });

  it('returns the last record when dropped on the trailing drop target', () => {
    expect(
      resolveDropTargetRecord({ records, toIndex: records.length }),
    ).toEqual({
      targetRecord: { id: 'c' },
      isDroppedAfterList: true,
    });
  });

  it('returns the last record when toIndex overshoots the list', () => {
    expect(resolveDropTargetRecord({ records, toIndex: 10 })).toEqual({
      targetRecord: { id: 'c' },
      isDroppedAfterList: true,
    });
  });

  it('returns no record for an empty list', () => {
    expect(resolveDropTargetRecord({ records: [], toIndex: 0 })).toEqual({
      targetRecord: undefined,
      isDroppedAfterList: true,
    });
  });
});
