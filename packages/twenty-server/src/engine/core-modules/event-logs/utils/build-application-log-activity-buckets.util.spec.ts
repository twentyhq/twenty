import { buildApplicationLogActivityBuckets } from './build-application-log-activity-buckets.util';

describe('application log activity', () => {
  const start = new Date('2026-10-16T00:00:00Z');
  it('fills missing buckets with zero counts and preserves severity totals', () => {
    const result = buildApplicationLogActivityBuckets({
      start,
      end: new Date(start.getTime() + 2500),
      duration: 1000,
      rows: [{ bucket: 1, info: 250, warning: 8, error: 4 }],
    });
    expect(result).toEqual([
      {
        start,
        end: new Date(start.getTime() + 1000),
        info: 0,
        warning: 0,
        error: 0,
      },
      {
        start: new Date(start.getTime() + 1000),
        end: new Date(start.getTime() + 2000),
        info: 250,
        warning: 8,
        error: 4,
      },
      {
        start: new Date(start.getTime() + 2000),
        end: new Date(start.getTime() + 2500),
        info: 0,
        warning: 0,
        error: 0,
      },
    ]);
  });
  it('bounds the number of buckets', () => {
    expect(
      buildApplicationLogActivityBuckets({
        start,
        end: new Date(start.getTime() + 1e12),
        duration: 1e12 / 48,
        rows: [],
      }),
    ).toHaveLength(48);
  });
  it('returns no buckets for an empty interval', () => {
    expect(
      buildApplicationLogActivityBuckets({
        start,
        end: start,
        duration: 1,
        rows: [],
      }),
    ).toEqual([]);
  });
});
