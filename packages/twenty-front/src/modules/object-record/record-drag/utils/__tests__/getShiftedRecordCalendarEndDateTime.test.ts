import { getShiftedRecordCalendarEndDateTime } from '@/object-record/record-drag/utils/getShiftedRecordCalendarEndDateTime';
import { Temporal } from 'temporal-polyfill';

const originalStartInstant = Temporal.Instant.from('2026-07-07T07:00:00Z');
const shiftedStartInstant = Temporal.Instant.from('2026-07-10T08:00:00Z');

describe('getShiftedRecordCalendarEndDateTime', () => {
  it('preserves the original elapsed duration from the shifted start', () => {
    expect(
      getShiftedRecordCalendarEndDateTime({
        endDateTime: '2026-07-09T10:00:00Z',
        originalStartInstant,
        shiftedStartInstant,
      }),
    ).toBe('2026-07-12T11:00:00Z');
  });

  it('preserves a zero-duration end', () => {
    expect(
      getShiftedRecordCalendarEndDateTime({
        endDateTime: originalStartInstant.toString(),
        originalStartInstant,
        shiftedStartInstant,
      }),
    ).toBe(shiftedStartInstant.toString());
  });

  it.each([
    ['missing', undefined],
    ['null', null],
    ['non-string', 42],
    ['malformed', 'not-a-date'],
    ['before the start', '2026-07-07T06:59:00Z'],
  ])('returns undefined when the end is %s', (_label, endDateTime) => {
    expect(
      getShiftedRecordCalendarEndDateTime({
        endDateTime,
        originalStartInstant,
        shiftedStartInstant,
      }),
    ).toBeUndefined();
  });
});
