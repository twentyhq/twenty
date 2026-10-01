import { getRecordTimelineWindow } from '@/object-record/record-timeline/utils/getRecordTimelineWindow';
import { Temporal } from 'temporal-polyfill';

const MONDAY = 1;

describe('getRecordTimelineWindow', () => {
  it('starts a week window on the configured week start day', () => {
    const { firstDay, lastDay, days } = getRecordTimelineWindow({
      anchorDate: Temporal.PlainDate.from('2026-10-01'),
      zoom: 'WEEK',
      weekStartsOnDayIndex: MONDAY,
    });

    expect(firstDay.toString()).toBe('2026-09-28');
    expect(lastDay.toString()).toBe('2026-10-04');
    expect(days).toHaveLength(7);
  });

  it('covers the whole month', () => {
    const { firstDay, lastDay, days } = getRecordTimelineWindow({
      anchorDate: Temporal.PlainDate.from('2026-02-14'),
      zoom: 'MONTH',
      weekStartsOnDayIndex: MONDAY,
    });

    expect(firstDay.toString()).toBe('2026-02-01');
    expect(lastDay.toString()).toBe('2026-02-28');
    expect(days).toHaveLength(28);
  });

  it('covers the whole quarter', () => {
    const { firstDay, lastDay } = getRecordTimelineWindow({
      anchorDate: Temporal.PlainDate.from('2026-11-15'),
      zoom: 'QUARTER',
      weekStartsOnDayIndex: MONDAY,
    });

    expect(firstDay.toString()).toBe('2026-10-01');
    expect(lastDay.toString()).toBe('2026-12-31');
  });
});
