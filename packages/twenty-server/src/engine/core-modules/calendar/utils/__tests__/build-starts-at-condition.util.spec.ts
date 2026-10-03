import { And, LessThan, MoreThanOrEqual } from 'typeorm';

import { buildStartsAtCondition } from 'src/engine/core-modules/calendar/utils/build-starts-at-condition.util';

describe('buildStartsAtCondition', () => {
  const startsAtFrom = new Date('2026-03-01T00:00:00.000Z');
  const startsAtBefore = new Date('2026-04-01T00:00:00.000Z');

  it('returns undefined when no bound is given', () => {
    expect(buildStartsAtCondition({})).toBeUndefined();
  });

  it('includes events starting exactly at the lower bound', () => {
    expect(buildStartsAtCondition({ startsAtFrom })).toEqual(
      And(MoreThanOrEqual('2026-03-01T00:00:00.000Z')),
    );
  });

  it('excludes events starting exactly at the upper bound', () => {
    expect(buildStartsAtCondition({ startsAtBefore })).toEqual(
      And(LessThan('2026-04-01T00:00:00.000Z')),
    );
  });

  it('combines both bounds', () => {
    expect(buildStartsAtCondition({ startsAtFrom, startsAtBefore })).toEqual(
      And(
        MoreThanOrEqual('2026-03-01T00:00:00.000Z'),
        LessThan('2026-04-01T00:00:00.000Z'),
      ),
    );
  });
});
