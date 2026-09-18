import { getAgentChatThreadSnoozeDate } from '@/ai/utils/getAgentChatThreadSnoozeDate';

// A Wednesday, mid-afternoon.
const WEDNESDAY = new Date('2026-09-16T14:30:00');
const FRIDAY = new Date('2026-09-18T14:30:00');
const MONDAY = new Date('2026-09-21T14:30:00');

describe('getAgentChatThreadSnoozeDate', () => {
  it('counts an hour forward from now', () => {
    expect(getAgentChatThreadSnoozeDate('oneHour', WEDNESDAY)).toEqual(
      new Date('2026-09-16T15:30:00'),
    );
  });

  it('wakes tomorrow at the start of the morning, not at this time tomorrow', () => {
    const tomorrow = getAgentChatThreadSnoozeDate('tomorrow', WEDNESDAY);

    expect(tomorrow.getDate()).toBe(17);
    expect(tomorrow.getHours()).toBe(9);
    expect(tomorrow.getMinutes()).toBe(0);
  });

  it('sends a thread put off on Friday and one put off on Wednesday to the same Monday', () => {
    expect(getAgentChatThreadSnoozeDate('nextWeek', WEDNESDAY)).toEqual(
      getAgentChatThreadSnoozeDate('nextWeek', FRIDAY),
    );
    expect(getAgentChatThreadSnoozeDate('nextWeek', WEDNESDAY).getDay()).toBe(1);
  });

  it('carries a Monday over to the following Monday rather than staying put', () => {
    const nextWeek = getAgentChatThreadSnoozeDate('nextWeek', MONDAY);

    expect(nextWeek.getDate()).toBe(28);
    expect(nextWeek.getDay()).toBe(1);
  });
});
