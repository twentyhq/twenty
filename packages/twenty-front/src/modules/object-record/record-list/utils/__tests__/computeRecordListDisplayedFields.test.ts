import { computeRecordListDisplayedFields } from '@/object-record/record-list/utils/computeRecordListDisplayedFields';

describe('computeRecordListDisplayedFields', () => {
  it('accounts for row padding when calculating field breakpoints', () => {
    expect(computeRecordListDisplayedFields(408).displayedFieldCount).toBe(1);
    expect(computeRecordListDisplayedFields(576).displayedFieldCount).toBe(2);
  });

  it('keeps one narrowed field on rows too tight for a full-width one', () => {
    expect(computeRecordListDisplayedFields(407).displayedFieldCount).toBe(1);
    expect(computeRecordListDisplayedFields(332).displayedFieldCount).toBe(1);
  });

  it('returns no field when not even a narrowed one fits', () => {
    expect(computeRecordListDisplayedFields(331).displayedFieldCount).toBe(0);
    expect(computeRecordListDisplayedFields(0).displayedFieldCount).toBe(0);
  });

  it('caps the displayed field count at the visible field limit', () => {
    expect(computeRecordListDisplayedFields(10_000).displayedFieldCount).toBe(
      6,
    );
  });

  it('gives fields their full width as soon as the row can afford it', () => {
    expect(computeRecordListDisplayedFields(408).displayedFieldMaxWidth).toBe(
      156,
    );
    expect(
      computeRecordListDisplayedFields(10_000).displayedFieldMaxWidth,
    ).toBe(156);
  });

  it('narrows the field to its slot on rows below the full-width breakpoint', () => {
    // A 390px viewport leaves a 342px row, so the single field gets 90px.
    expect(computeRecordListDisplayedFields(342).displayedFieldMaxWidth).toBe(
      90,
    );
  });

  // Row padding 12 + label 176 + gap 12 + hidden-count chip 40.
  const WIDTH_RESERVED_AROUND_FIELDS = 240;
  const GAP_BEFORE_EACH_FIELD = 12;

  it.each([332, 342, 380, 407, 408, 500, 576, 900, 1200])(
    'never promises a %ipx row more field width than it has',
    (rowWidth) => {
      const { displayedFieldCount, displayedFieldMaxWidth } =
        computeRecordListDisplayedFields(rowWidth);

      const widthTakenByFields =
        displayedFieldCount * (displayedFieldMaxWidth + GAP_BEFORE_EACH_FIELD);

      expect(widthTakenByFields).toBeLessThanOrEqual(
        rowWidth - WIDTH_RESERVED_AROUND_FIELDS,
      );
    },
  );
});
