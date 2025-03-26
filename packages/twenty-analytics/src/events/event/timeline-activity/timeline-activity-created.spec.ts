import { timelineActivityCreatedSchema } from './timeline-activity-created';
import { fixtures } from '../../../../tests/fixtures';

describe('timelineActivityCreatedSchema', () => {
  const timelineActivityCreatedFixtures = fixtures.filter(
    (fixture) => fixture.action === 'timelineActivity.created',
  );

  it('should have fixtures to test against', () => {
    expect(timelineActivityCreatedFixtures.length).toBeGreaterThan(0);
  });

  it('should validate all timelineActivity.created fixtures', () => {
    for (const fixture of timelineActivityCreatedFixtures) {
      const result = timelineActivityCreatedSchema.safeParse(fixture);

      expect(result.success).toBe(true);
    }
  });

  it('should reject fixtures with different action types', () => {
    const nonTimelineActivityFixture = fixtures.find(
      (fixture) => fixture.action !== 'timelineActivity.created',
    );

    if (nonTimelineActivityFixture) {
      const result = timelineActivityCreatedSchema.safeParse(
        nonTimelineActivityFixture,
      );
      expect(result.success).toBe(false);
    }
  });
});
