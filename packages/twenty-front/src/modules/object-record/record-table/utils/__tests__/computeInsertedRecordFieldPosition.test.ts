import { computeInsertedRecordFieldPosition } from '@/object-record/record-table/utils/computeInsertedRecordFieldPosition';

describe('computeInsertedRecordFieldPosition', () => {
  it('places the column between the source column and the next one', () => {
    expect(
      computeInsertedRecordFieldPosition({
        recordFields: [{ position: 0 }, { position: 1 }, { position: 2 }],
        afterRecordField: { position: 1 },
      }),
    ).toBe(1.5);
  });

  it('ignores the order of the columns', () => {
    expect(
      computeInsertedRecordFieldPosition({
        recordFields: [{ position: 7 }, { position: 2 }, { position: 4 }],
        afterRecordField: { position: 2 },
      }),
    ).toBe(3);
  });

  it('places the column after the last one', () => {
    expect(
      computeInsertedRecordFieldPosition({
        recordFields: [{ position: 0 }, { position: 3 }],
        afterRecordField: { position: 3 },
      }),
    ).toBe(4);
  });
});
