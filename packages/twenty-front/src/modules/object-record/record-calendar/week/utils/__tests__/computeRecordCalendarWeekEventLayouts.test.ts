import { computeRecordCalendarWeekEventLayouts } from '@/object-record/record-calendar/week/utils/computeRecordCalendarWeekEventLayouts';

describe('computeRecordCalendarWeekEventLayouts', () => {
  it('gives non-overlapping events the full column width', () => {
    const layouts = computeRecordCalendarWeekEventLayouts([
      { recordId: 'first', startInPixels: 0, endInPixels: 44 },
      { recordId: 'second', startInPixels: 44, endInPixels: 88 },
    ]);

    expect(layouts).toEqual([
      {
        recordId: 'first',
        startInPixels: 0,
        endInPixels: 44,
        columnIndex: 0,
        columnCount: 1,
      },
      {
        recordId: 'second',
        startInPixels: 44,
        endInPixels: 88,
        columnIndex: 0,
        columnCount: 1,
      },
    ]);
  });

  it('places overlapping events in adjacent columns', () => {
    const layouts = computeRecordCalendarWeekEventLayouts([
      { recordId: 'first', startInPixels: 0, endInPixels: 44 },
      { recordId: 'second', startInPixels: 10, endInPixels: 54 },
      { recordId: 'third', startInPixels: 20, endInPixels: 64 },
    ]);

    expect(
      layouts.map(({ recordId, columnIndex, columnCount }) => ({
        recordId,
        columnIndex,
        columnCount,
      })),
    ).toEqual([
      { recordId: 'first', columnIndex: 0, columnCount: 3 },
      { recordId: 'second', columnIndex: 1, columnCount: 3 },
      { recordId: 'third', columnIndex: 2, columnCount: 3 },
    ]);
  });

  it('keeps every event in a larger overlapping group', () => {
    const layouts = computeRecordCalendarWeekEventLayouts([
      { recordId: 'first', startInPixels: 0, endInPixels: 60 },
      { recordId: 'second', startInPixels: 0, endInPixels: 60 },
      { recordId: 'third', startInPixels: 0, endInPixels: 60 },
      { recordId: 'fourth', startInPixels: 15, endInPixels: 75 },
      { recordId: 'fifth', startInPixels: 30, endInPixels: 90 },
    ]);

    expect(
      layouts.map(({ recordId, columnIndex, columnCount }) => ({
        recordId,
        columnIndex,
        columnCount,
      })),
    ).toEqual([
      { recordId: 'first', columnIndex: 0, columnCount: 5 },
      { recordId: 'second', columnIndex: 1, columnCount: 5 },
      { recordId: 'third', columnIndex: 2, columnCount: 5 },
      { recordId: 'fourth', columnIndex: 3, columnCount: 5 },
      { recordId: 'fifth', columnIndex: 4, columnCount: 5 },
    ]);
  });

  it('reuses a free column within an overlapping group', () => {
    const layouts = computeRecordCalendarWeekEventLayouts([
      { recordId: 'first', startInPixels: 0, endInPixels: 44 },
      { recordId: 'second', startInPixels: 10, endInPixels: 54 },
      { recordId: 'third', startInPixels: 44, endInPixels: 88 },
    ]);

    expect(
      layouts.map(({ recordId, columnIndex, columnCount }) => ({
        recordId,
        columnIndex,
        columnCount,
      })),
    ).toEqual([
      { recordId: 'first', columnIndex: 0, columnCount: 2 },
      { recordId: 'second', columnIndex: 1, columnCount: 2 },
      { recordId: 'third', columnIndex: 0, columnCount: 2 },
    ]);
  });

  it('keeps a long event in the first column while shorter events reuse the overlay column', () => {
    const layouts = computeRecordCalendarWeekEventLayouts([
      { recordId: 'long', startInPixels: 0, endInPixels: 180 },
      { recordId: 'first-short', startInPixels: 30, endInPixels: 60 },
      { recordId: 'second-short', startInPixels: 60, endInPixels: 90 },
    ]);

    expect(
      layouts.map(({ recordId, columnIndex, columnCount }) => ({
        recordId,
        columnIndex,
        columnCount,
      })),
    ).toEqual([
      { recordId: 'long', columnIndex: 0, columnCount: 2 },
      { recordId: 'first-short', columnIndex: 1, columnCount: 2 },
      { recordId: 'second-short', columnIndex: 1, columnCount: 2 },
    ]);
  });

  it('places the longer event behind shorter events with the same start', () => {
    const layouts = computeRecordCalendarWeekEventLayouts([
      { recordId: 'short', startInPixels: 0, endInPixels: 60 },
      { recordId: 'long', startInPixels: 0, endInPixels: 180 },
    ]);

    expect(
      layouts.map(({ recordId, columnIndex, columnCount }) => ({
        recordId,
        columnIndex,
        columnCount,
      })),
    ).toEqual([
      { recordId: 'long', columnIndex: 0, columnCount: 2 },
      { recordId: 'short', columnIndex: 1, columnCount: 2 },
    ]);
  });

  it('sorts events before assigning columns', () => {
    const layouts = computeRecordCalendarWeekEventLayouts([
      { recordId: 'second', startInPixels: 10, endInPixels: 54 },
      { recordId: 'first', startInPixels: 0, endInPixels: 44 },
    ]);

    expect(layouts.map(({ recordId }) => recordId)).toEqual([
      'first',
      'second',
    ]);
  });
});
