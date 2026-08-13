import { describe, expect, it } from 'vitest';

import {
  buildPersonUpdateData,
  type PersonAgg,
  recordInteractionMetric,
} from 'src/utils/person-last-contact-aggregation';

const MEMBER_A = '11111111-1111-4111-8111-111111111111';
const MEMBER_B = '22222222-2222-4222-8222-222222222222';

describe('person interaction metrics', () => {
  it('counts interactions and selects the member with the most interactions', () => {
    const aggregate: PersonAgg = {};

    recordInteractionMetric(aggregate, '2026-06-01T09:00:00.000Z', MEMBER_A);
    recordInteractionMetric(aggregate, '2026-06-02T09:00:00.000Z', MEMBER_B);
    recordInteractionMetric(aggregate, '2026-06-03T09:00:00.000Z', MEMBER_A);
    recordInteractionMetric(aggregate, '2026-06-04T09:00:00.000Z', null);

    expect(buildPersonUpdateData(aggregate)).toMatchObject({
      interactionCount: 4,
      strongestConnectionId: MEMBER_A,
    });
  });

  it('breaks equal-count ties by the most recent interaction', () => {
    const aggregate: PersonAgg = {};

    recordInteractionMetric(aggregate, '2026-06-03T09:00:00.000Z', MEMBER_A);
    recordInteractionMetric(aggregate, '2026-06-04T09:00:00.000Z', MEMBER_B);

    expect(buildPersonUpdateData(aggregate).strongestConnectionId).toBe(
      MEMBER_B,
    );
  });

  it('writes empty metrics for a person with no interactions', () => {
    expect(buildPersonUpdateData(undefined)).toEqual({
      interactionCount: 0,
      strongestConnectionId: null,
    });
  });
});
