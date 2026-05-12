import { describe, expect, it } from 'vitest';

import { computeEmailStats } from '@modules/resend/email-stats/utils/compute-email-stats';

describe('computeEmailStats', () => {
  it('returns zeroed counts and a null deliverability rate for an empty list', () => {
    const stats = computeEmailStats([]);

    expect(stats.total).toBe(0);
    expect(stats.deliverabilityRate).toBeNull();
    expect(stats.groupCounts).toEqual({
      reached: 0,
      failed: 0,
      inFlight: 0,
      other: 0,
    });
    expect(stats.countsByStatus.DELIVERED).toBe(0);
    expect(stats.countsByStatus.BOUNCED).toBe(0);
  });

  it('returns a deliverability rate of 1 when all emails are delivered', () => {
    const stats = computeEmailStats([
      { lastEvent: 'DELIVERED' },
      { lastEvent: 'DELIVERED' },
      { lastEvent: 'OPENED' },
      { lastEvent: 'CLICKED' },
    ]);

    expect(stats.total).toBe(4);
    expect(stats.groupCounts.reached).toBe(4);
    expect(stats.groupCounts.failed).toBe(0);
    expect(stats.deliverabilityRate).toBe(1);
  });

  it('returns a deliverability rate of 0 when every email failed', () => {
    const stats = computeEmailStats([
      { lastEvent: 'BOUNCED' },
      { lastEvent: 'FAILED' },
      { lastEvent: 'COMPLAINED' },
      { lastEvent: 'SUPPRESSED' },
    ]);

    expect(stats.total).toBe(4);
    expect(stats.groupCounts.reached).toBe(0);
    expect(stats.groupCounts.failed).toBe(4);
    expect(stats.deliverabilityRate).toBe(0);
  });

  it('returns a null deliverability rate when only in-flight statuses are present', () => {
    const stats = computeEmailStats([
      { lastEvent: 'SENT' },
      { lastEvent: 'QUEUED' },
      { lastEvent: 'SCHEDULED' },
      { lastEvent: 'DELIVERY_DELAYED' },
    ]);

    expect(stats.total).toBe(4);
    expect(stats.groupCounts.inFlight).toBe(4);
    expect(stats.deliverabilityRate).toBeNull();
  });

  it('aggregates a mixed list correctly', () => {
    const stats = computeEmailStats([
      { lastEvent: 'DELIVERED' },
      { lastEvent: 'DELIVERED' },
      { lastEvent: 'OPENED' },
      { lastEvent: 'BOUNCED' },
      { lastEvent: 'FAILED' },
      { lastEvent: 'SENT' },
      { lastEvent: 'CANCELED' },
    ]);

    expect(stats.total).toBe(7);
    expect(stats.countsByStatus.DELIVERED).toBe(2);
    expect(stats.countsByStatus.OPENED).toBe(1);
    expect(stats.countsByStatus.BOUNCED).toBe(1);
    expect(stats.countsByStatus.FAILED).toBe(1);
    expect(stats.countsByStatus.SENT).toBe(1);
    expect(stats.countsByStatus.CANCELED).toBe(1);

    expect(stats.groupCounts).toEqual({
      reached: 3,
      failed: 2,
      inFlight: 1,
      other: 1,
    });

    expect(stats.deliverabilityRate).toBeCloseTo(3 / 5);
  });

  it('ignores unknown, null, and undefined statuses', () => {
    const stats = computeEmailStats([
      { lastEvent: 'DELIVERED' },
      { lastEvent: 'BOUNCED' },
      { lastEvent: null },
      { lastEvent: undefined },
      { lastEvent: 'NOT_A_REAL_STATUS' },
      {},
    ]);

    expect(stats.total).toBe(2);
    expect(stats.groupCounts.reached).toBe(1);
    expect(stats.groupCounts.failed).toBe(1);
    expect(stats.deliverabilityRate).toBe(0.5);
  });
});
