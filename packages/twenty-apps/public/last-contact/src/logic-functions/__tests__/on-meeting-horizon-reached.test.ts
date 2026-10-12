import { describe, expect, it } from 'vitest';

import onMeetingHorizonReached from '../on-meeting-horizon-reached';

describe('on-meeting-horizon-reached', () => {
  it('should be valid and have no trigger of its own', () => {
    expect(onMeetingHorizonReached.success).toBe(true);
    expect(onMeetingHorizonReached.config.cronTriggerSettings).toBeUndefined();
    expect(
      onMeetingHorizonReached.config.databaseEventTriggerSettings,
    ).toBeUndefined();
  });
});
