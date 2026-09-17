import { describe, expect, it } from 'vitest';

import { buildAccountBriefPrompt } from 'src/logic-functions/domain/build-account-brief-prompt.util';
import { type AccountBriefActivity } from 'src/logic-functions/domain/account-brief-activity.type';

const makeActivity = (index: number): AccountBriefActivity => ({
  id: `activity-${index}`,
  name: 'email.sent',
  happensAt: new Date(Date.UTC(2026, 8, 16, index)).toISOString(),
  properties: { subject: `Update ${index}` },
});

describe('buildAccountBriefPrompt', () => {
  it('serializes the account name and the activities as JSON', () => {
    const prompt = buildAccountBriefPrompt('Crove JSC', [makeActivity(0)]);

    const parsed = JSON.parse(prompt) as {
      account: string;
      activityCount: number;
      activities: { name: string; happensAt: string; properties: unknown }[];
    };

    expect(parsed.account).toBe('Crove JSC');
    expect(parsed.activityCount).toBe(1);
    expect(parsed.activities[0].name).toBe('email.sent');
    expect(parsed.activities[0].properties).toEqual({
      subject: 'Update 0',
    });
  });

  it('caps the activity list so the prompt stays bounded', () => {
    const activities = Array.from({ length: 150 }, (_, index) =>
      makeActivity(index),
    );

    const parsed = JSON.parse(
      buildAccountBriefPrompt('Crove JSC', activities),
    ) as { activityCount: number; activities: unknown[] };

    expect(parsed.activityCount).toBe(150);
    expect(parsed.activities).toHaveLength(100);
    // The most recent activities are kept (slice from the end).
    expect(
      parsed.activities.some(
        (activity) =>
          (activity as { properties: { subject: string } }).properties
            .subject === 'Update 149',
      ),
    ).toBe(true);
    expect(
      parsed.activities.some(
        (activity) =>
          (activity as { properties: { subject: string } }).properties
            .subject === 'Update 0',
      ),
    ).toBe(false);
  });
});
