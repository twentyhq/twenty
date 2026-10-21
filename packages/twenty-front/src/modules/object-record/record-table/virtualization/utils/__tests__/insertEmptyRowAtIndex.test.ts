import { insertEmptyRowAtIndex } from '@/object-record/record-table/virtualization/utils/insertEmptyRowAtIndex';

describe('insertEmptyRowAtIndex', () => {
  it('moves the rows at and after the index down by one and leaves the index empty', () => {
    const recordIds: string[] = [];

    recordIds[0] = 'a';
    recordIds[1] = 'b';
    recordIds[3] = 'c';

    const nextRecordIds = insertEmptyRowAtIndex({
      recordIdsByRowIndex: recordIds,
      rowIndex: 1,
    });

    expect(nextRecordIds[0]).toBe('a');
    expect(1 in nextRecordIds).toBe(false);
    expect(nextRecordIds[2]).toBe('b');
    expect(3 in nextRecordIds).toBe(false);
    expect(nextRecordIds[4]).toBe('c');
  });
});
