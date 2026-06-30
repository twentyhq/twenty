import { describe, expect, it } from 'vitest';

import {
  RESEND_SYNC_CRON_PATTERNS,
  RESEND_SYNC_SLOT_DEADLINE_SLACK_MS,
  RESEND_SYNC_SLOT_TIMEOUT_SECONDS,
} from '@modules/resend/constants/sync-config';

const minutesInOneHour = (pattern: string): number[] => {
  const [minuteField, hourField, ...rest] = pattern.split(' ');

  expect(hourField).toBe('*');
  expect(rest).toEqual(['*', '*', '*']);

  const stepMatch = minuteField.match(/^(\d+)-59\/(\d+)$/);

  if (stepMatch === null) {
    throw new Error(
      `Unsupported cron minute field for this test helper: ${minuteField}`,
    );
  }

  const start = Number(stepMatch[1]);
  const step = Number(stepMatch[2]);
  const minutes: number[] = [];

  for (let m = start; m < 60; m += step) {
    minutes.push(m);
  }

  return minutes;
};

describe('RESEND_SYNC_CRON_PATTERNS', () => {
  it('runs each cron exactly once per 5-minute window with a unique minute offset', () => {
    const offsets = {
      EMAILS: minutesInOneHour(RESEND_SYNC_CRON_PATTERNS.EMAILS).map(
        (m) => m % 5,
      ),
      CONTACTS: minutesInOneHour(RESEND_SYNC_CRON_PATTERNS.CONTACTS).map(
        (m) => m % 5,
      ),
      BROADCASTS: minutesInOneHour(RESEND_SYNC_CRON_PATTERNS.BROADCASTS).map(
        (m) => m % 5,
      ),
      TEMPLATES: minutesInOneHour(RESEND_SYNC_CRON_PATTERNS.TEMPLATES).map(
        (m) => m % 5,
      ),
    };

    expect(new Set(offsets.EMAILS)).toEqual(new Set([0]));
    expect(new Set(offsets.CONTACTS)).toEqual(new Set([1]));
    expect(new Set(offsets.BROADCASTS)).toEqual(new Set([2]));
    expect(new Set(offsets.TEMPLATES)).toEqual(new Set([3]));

    const firstOffsets = [
      offsets.EMAILS[0],
      offsets.CONTACTS[0],
      offsets.BROADCASTS[0],
      offsets.TEMPLATES[0],
    ];

    expect(new Set(firstOffsets).size).toBe(4);
  });

  it('fires every five minutes for each cron', () => {
    for (const pattern of Object.values(RESEND_SYNC_CRON_PATTERNS)) {
      const minutes = minutesInOneHour(pattern);

      expect(minutes).toHaveLength(12);
      for (let i = 1; i < minutes.length; i++) {
        expect(minutes[i] - minutes[i - 1]).toBe(5);
      }
    }
  });
});

describe('RESEND_SYNC_SLOT_TIMEOUT_SECONDS', () => {
  it('keeps every 1-minute slot strictly under 60 seconds and the trailing 2-minute slot under 120 seconds', () => {
    expect(RESEND_SYNC_SLOT_TIMEOUT_SECONDS.EMAILS).toBeLessThan(60);
    expect(RESEND_SYNC_SLOT_TIMEOUT_SECONDS.CONTACTS).toBeLessThan(60);
    expect(RESEND_SYNC_SLOT_TIMEOUT_SECONDS.BROADCASTS).toBeLessThan(60);
    expect(RESEND_SYNC_SLOT_TIMEOUT_SECONDS.TEMPLATES).toBeLessThan(120);
  });

  it('leaves enough slack for the deadline check to fire before the hard timeout', () => {
    expect(RESEND_SYNC_SLOT_DEADLINE_SLACK_MS).toBeGreaterThan(0);
    expect(RESEND_SYNC_SLOT_DEADLINE_SLACK_MS).toBeLessThan(
      RESEND_SYNC_SLOT_TIMEOUT_SECONDS.EMAILS * 1_000,
    );
  });
});
