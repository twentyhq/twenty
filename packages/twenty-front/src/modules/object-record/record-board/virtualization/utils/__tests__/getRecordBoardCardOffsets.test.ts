import { getRecordBoardCardOffsets } from '@/object-record/record-board/virtualization/utils/getRecordBoardCardOffsets';

describe('getRecordBoardCardOffsets', () => {
  it('should cumulate measured card heights', () => {
    expect(
      getRecordBoardCardOffsets({
        recordIds: ['record-1', 'record-2', 'record-3'],
        cardHeightByRecordId: {
          'record-1': 50,
          'record-2': 100,
          'record-3': 150,
        },
        estimatedCardHeight: 80,
      }),
    ).toEqual([0, 50, 150, 300]);
  });

  it('should fall back to the estimated height for unmeasured cards', () => {
    expect(
      getRecordBoardCardOffsets({
        recordIds: ['record-1', 'record-2', 'record-3'],
        cardHeightByRecordId: {
          'record-2': 100,
        },
        estimatedCardHeight: 80,
      }),
    ).toEqual([0, 80, 180, 260]);
  });

  it('should return a single zero offset for an empty column', () => {
    expect(
      getRecordBoardCardOffsets({
        recordIds: [],
        cardHeightByRecordId: {},
        estimatedCardHeight: 80,
      }),
    ).toEqual([0]);
  });
});
