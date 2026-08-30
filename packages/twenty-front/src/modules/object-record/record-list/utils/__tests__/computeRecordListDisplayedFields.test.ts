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
    expect(computeRecordListDisplayedFields(383).displayedFieldMaxWidth).toBe(
      131,
    );
  });
});
