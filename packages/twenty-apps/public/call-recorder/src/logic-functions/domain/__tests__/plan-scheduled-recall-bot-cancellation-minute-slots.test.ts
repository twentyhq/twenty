import { describe, expect, it } from 'vitest';

import { planScheduledRecallBotCancellationMinuteSlots } from 'src/logic-functions/domain/plan-scheduled-recall-bot-cancellation-minute-slots.util';
import { type CanceledCallRecordingBot } from 'src/logic-functions/types/canceled-call-recording-bot.type';

const NOW = new Date('2026-11-17T09:00:00.000Z');

const buildUpcomingCanceledCallRecordingBots = (
  count: number,
): CanceledCallRecordingBot[] =>
  Array.from({ length: count }, (_, index) => ({
    callRecordingId: `call-recording-${String(index).padStart(4, '0')}`,
    externalBotId: `recall-bot-${index}`,
    meetingStartsAt: new Date(
      NOW.getTime() + (index + 1) * 60 * 1000,
    ).toISOString(),
  }));

const planFor = (canceledCallRecordingBots: CanceledCallRecordingBot[]) =>
  planScheduledRecallBotCancellationMinuteSlots({
    canceledCallRecordingBots,
    now: NOW,
  });

const getPlannedCallRecordingIds = (
  canceledCallRecordingBots: CanceledCallRecordingBot[],
) =>
  planFor(canceledCallRecordingBots)
    .minuteSlots.flat()
    .map(({ callRecordingId }) => callRecordingId);

const getSlotSizes = (canceledCallRecordingBots: CanceledCallRecordingBot[]) =>
  planFor(canceledCallRecordingBots).minuteSlots.map(
    (minuteSlot) => minuteSlot.length,
  );

describe('planScheduledRecallBotCancellationMinuteSlots', () => {
  it('plans nothing when there is nothing to cancel', () => {
    expect(planFor([])).toEqual({
      minuteSlots: [],
      unplannedCallRecordingCount: 0,
    });
  });

  it('keeps a full minute of cancellations in one slot', () => {
    expect(getSlotSizes(buildUpcomingCanceledCallRecordingBots(30))).toEqual([
      30,
    ]);
  });

  it('moves one cancellation over a full minute into the next slot', () => {
    expect(getSlotSizes(buildUpcomingCanceledCallRecordingBots(31))).toEqual([
      30, 1,
    ]);
  });

  it('spreads many cancellations over as many minutes as they need', () => {
    expect(getSlotSizes(buildUpcomingCanceledCallRecordingBots(95))).toEqual([
      30, 30, 30, 5,
    ]);
  });

  it('keeps only the bot identifiers in the planned cancellations', () => {
    expect(
      planFor(buildUpcomingCanceledCallRecordingBots(1)).minuteSlots,
    ).toEqual([
      [
        {
          callRecordingId: 'call-recording-0000',
          externalBotId: 'recall-bot-0',
        },
      ],
    ]);
  });

  it('plans exactly the cap, thirty minutes of thirty cancellations', () => {
    const plan = planFor(buildUpcomingCanceledCallRecordingBots(900));

    expect(plan.minuteSlots).toHaveLength(30);
    expect(
      plan.minuteSlots.every((minuteSlot) => minuteSlot.length === 30),
    ).toBe(true);
    expect(plan.unplannedCallRecordingCount).toBe(0);
  });

  it('leaves the last meeting in order out when one over the cap, never a sooner one', () => {
    const canceledCallRecordingBots =
      buildUpcomingCanceledCallRecordingBots(901);
    const plan = planFor([...canceledCallRecordingBots].reverse());
    const plannedCallRecordingIds = plan.minuteSlots
      .flat()
      .map(({ callRecordingId }) => callRecordingId);

    expect(plan.unplannedCallRecordingCount).toBe(1);
    expect(plannedCallRecordingIds).toHaveLength(900);
    expect(plannedCallRecordingIds[0]).toBe('call-recording-0000');
    expect(plannedCallRecordingIds).not.toContain('call-recording-0900');
  });

  it('orders meetings not yet over first, then meetings without a start, then ended meetings', () => {
    expect(
      getPlannedCallRecordingIds([
        {
          callRecordingId: 'missing-event',
          externalBotId: 'recall-bot-missing-event',
        },
        {
          callRecordingId: 'ended-this-morning',
          externalBotId: 'recall-bot-ended-this-morning',
          meetingStartsAt: '2026-11-17T07:00:00.000Z',
          meetingEndsAt: '2026-11-17T08:00:00.000Z',
        },
        {
          callRecordingId: 'next-week',
          externalBotId: 'recall-bot-next-week',
          meetingStartsAt: '2026-11-24T09:00:00.000Z',
          meetingEndsAt: '2026-11-24T10:00:00.000Z',
        },
        {
          callRecordingId: 'unparseable-start',
          externalBotId: 'recall-bot-unparseable-start',
          meetingStartsAt: 'not a date',
        },
        {
          callRecordingId: 'in-two-minutes',
          externalBotId: 'recall-bot-in-two-minutes',
          meetingStartsAt: '2026-11-17T09:02:00.000Z',
          meetingEndsAt: '2026-11-17T10:00:00.000Z',
        },
        {
          callRecordingId: 'ended-yesterday',
          externalBotId: 'recall-bot-ended-yesterday',
          meetingStartsAt: '2026-11-16T09:00:00.000Z',
          meetingEndsAt: '2026-11-16T10:00:00.000Z',
        },
        {
          callRecordingId: 'in-progress',
          externalBotId: 'recall-bot-in-progress',
          meetingStartsAt: '2026-11-17T08:30:00.000Z',
          meetingEndsAt: '2026-11-17T09:30:00.000Z',
        },
      ]),
    ).toEqual([
      'in-progress',
      'in-two-minutes',
      'next-week',
      'missing-event',
      'unparseable-start',
      'ended-yesterday',
      'ended-this-morning',
    ]);
  });

  it('treats a meeting without an end time as over once it has started', () => {
    expect(
      getPlannedCallRecordingIds([
        {
          callRecordingId: 'started-without-end',
          externalBotId: 'recall-bot-started-without-end',
          meetingStartsAt: '2026-11-17T08:00:00.000Z',
        },
        {
          callRecordingId: 'missing-event',
          externalBotId: 'recall-bot-missing-event',
        },
        {
          callRecordingId: 'upcoming-without-end',
          externalBotId: 'recall-bot-upcoming-without-end',
          meetingStartsAt: '2026-11-17T11:00:00.000Z',
        },
      ]),
    ).toEqual(['upcoming-without-end', 'missing-event', 'started-without-end']);
  });

  it('orders cancellations of the same start by call recording id whatever the input order', () => {
    const sameStart = '2026-11-17T10:00:00.000Z';

    expect(
      getPlannedCallRecordingIds([
        {
          callRecordingId: 'b',
          externalBotId: 'bot-b',
          meetingStartsAt: sameStart,
        },
        { callRecordingId: 'd', externalBotId: 'bot-d' },
        {
          callRecordingId: 'a',
          externalBotId: 'bot-a',
          meetingStartsAt: sameStart,
        },
        { callRecordingId: 'c', externalBotId: 'bot-c' },
      ]),
    ).toEqual(['a', 'b', 'c', 'd']);
  });
});
