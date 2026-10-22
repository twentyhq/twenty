import { RECORD_TABLE_ROW_HEIGHT } from '@/object-record/record-table/constants/RecordTableRowHeight';
import { getRowSlotWindow } from '@/object-record/record-table/virtualization/utils/getRowSlotWindow';

const ROW_HEIGHT = RECORD_TABLE_ROW_HEIGHT + 1;
const VIEWPORT_HEIGHT = 20 * ROW_HEIGHT;

describe('getRowSlotWindow', () => {
  it('starts at the first row when scrolled to the top', () => {
    expect(
      getRowSlotWindow({
        scrollTop: 0,
        viewportHeight: VIEWPORT_HEIGHT,
        totalNumberOfRows: 1000,
      }),
    ).toEqual({ firstRowIndex: 0, lastRowIndex: 239 });
  });

  it('centers the window on the middle of the viewport', () => {
    expect(
      getRowSlotWindow({
        scrollTop: 500 * ROW_HEIGHT,
        viewportHeight: VIEWPORT_HEIGHT,
        totalNumberOfRows: 1000,
      }),
    ).toEqual({ firstRowIndex: 390, lastRowIndex: 629 });
  });

  it('ends at the last row when scrolled to the bottom', () => {
    expect(
      getRowSlotWindow({
        scrollTop: 980 * ROW_HEIGHT,
        viewportHeight: VIEWPORT_HEIGHT,
        totalNumberOfRows: 1000,
      }),
    ).toEqual({ firstRowIndex: 760, lastRowIndex: 999 });
  });

  it('covers every row when there are fewer rows than slots', () => {
    expect(
      getRowSlotWindow({
        scrollTop: 0,
        viewportHeight: VIEWPORT_HEIGHT,
        totalNumberOfRows: 50,
      }),
    ).toEqual({ firstRowIndex: 0, lastRowIndex: 49 });
  });
});
