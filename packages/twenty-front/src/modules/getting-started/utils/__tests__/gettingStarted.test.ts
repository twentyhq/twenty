import {
  GETTING_STARTED_STEPS,
  type GettingStartedProgress,
} from 'twenty-shared/types';
import { getGettingStartedSnoozedUntil } from '@/getting-started/utils/getGettingStartedSnoozedUntil';
import { getNextGettingStartedStep } from '@/getting-started/utils/getNextGettingStartedStep';
import { shouldOpenGettingStarted } from '@/getting-started/utils/shouldOpenGettingStarted';

const now = new Date('2026-03-28T22:30:00Z');
const progress: GettingStartedProgress = {
  completedSteps: [],
  selectedStep: null,
  snoozedUntil: null,
  creditsEarned: 0,
};

describe('Getting started navigation', () => {
  it('skips completed cards without completing the skipped action', () => {
    const completed = ['importData'] as const;
    expect(getNextGettingStartedStep('connectMailbox', [...completed])).toBe(
      'installApp',
    );
    expect(completed).toEqual(['importData']);
  });
  it('wraps to the first remaining action', () =>
    expect(getNextGettingStartedStep('followUpDeals', [])).toBe(
      'connectMailbox',
    ));
  it('has no next action after completion', () =>
    expect(
      getNextGettingStartedStep('followUpDeals', [...GETTING_STARTED_STEPS]),
    ).toBeNull());
  it('opens only loaded, unfinished, unsnoozed progress', () => {
    expect(shouldOpenGettingStarted(undefined, now.getTime())).toBe(false);
    expect(shouldOpenGettingStarted(progress, now.getTime())).toBe(true);
    expect(
      shouldOpenGettingStarted(
        { ...progress, completedSteps: [...GETTING_STARTED_STEPS] },
        now.getTime(),
      ),
    ).toBe(false);
    expect(
      shouldOpenGettingStarted(
        { ...progress, snoozedUntil: '2026-03-29T00:00:00Z' },
        now.getTime(),
      ),
    ).toBe(false);
    expect(
      shouldOpenGettingStarted(
        { ...progress, snoozedUntil: now.toISOString() },
        now.getTime(),
      ),
    ).toBe(true);
  });
});

describe('Getting started snooze', () => {
  const tomorrow = (time: string, timeZone: string) =>
    getGettingStartedSnoozedUntil({
      option: 'tomorrow',
      now: new Date(time),
      timeZone,
      trialEnd: null,
    });
  it('uses the next local date across spring DST', () => {
    expect(tomorrow('2026-03-29T00:30:00Z', 'Europe/Paris')).toBe(
      '2026-03-29T22:00:00.000Z',
    );
  });
  it('uses the next local date across autumn DST', () => {
    expect(tomorrow('2026-10-25T00:30:00Z', 'Europe/Paris')).toBe(
      '2026-10-25T23:00:00.000Z',
    );
  });
  it('handles timezones whose current date differs from UTC', () => {
    expect(tomorrow('2026-01-01T02:00:00Z', 'America/Los_Angeles')).toBe(
      '2026-01-01T08:00:00.000Z',
    );
    expect(tomorrow('2026-12-31T23:00:00Z', 'Asia/Tokyo')).toBe(
      '2027-01-01T15:00:00.000Z',
    );
  });
  it('uses exactly 72 hours before trial expiry', () => {
    expect(
      getGettingStartedSnoozedUntil({
        option: 'lastThreeDays',
        now,
        timeZone: 'Europe/Paris',
        trialEnd: new Date('2026-04-05T12:34:00Z'),
      }),
    ).toBe('2026-04-02T12:34:00.000Z');
  });
  it('disables the last-three-days option once its deadline has passed', () => {
    expect(
      getGettingStartedSnoozedUntil({
        option: 'lastThreeDays',
        now,
        timeZone: 'UTC',
        trialEnd: new Date('2026-03-30T12:00:00Z'),
      }),
    ).toBeNull();
    expect(
      getGettingStartedSnoozedUntil({
        option: 'lastThreeDays',
        now,
        timeZone: 'UTC',
        trialEnd: null,
      }),
    ).toBeNull();
  });
});
