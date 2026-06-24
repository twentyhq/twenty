import { describe, expect, it } from 'vitest';

import { buildMeetingBotPolicyResult } from 'src/logic-functions/domain/build-meeting-bot-policy-result.util';
import { type MeetingBotPolicyCalendarEventInput } from 'src/logic-functions/types/meeting-bot-policy-calendar-event-input.type';

const NOW = new Date('2026-01-01T12:00:00.000Z');

const buildCalendarEventInput = (
  overrides: Partial<MeetingBotPolicyCalendarEventInput>,
): MeetingBotPolicyCalendarEventInput => ({
  id: 'calendar-event-1',
  isCanceled: false,
  startsAt: '2026-01-01T13:00:00.000Z',
  endsAt: '2026-01-01T14:00:00.000Z',
  iCalUid: 'ical-uid-1',
  conferenceLinkUrl: 'https://meet.example.com/customer-sync',
  meetingBotPreference: undefined,
  ...overrides,
});

describe('buildMeetingBotPolicyResult', () => {
  it('requests a bot for the ON wire value', () => {
    const policyResult = buildMeetingBotPolicyResult(
      buildCalendarEventInput({
        meetingBotPreference: 'ON',
      }),
      NOW,
    );

    expect(policyResult.meetingBotPreference).toBe('ON');
    expect(policyResult.shouldRequestBot).toBe(true);
    expect(policyResult.reason).toBe('RECORDING_ENABLED');
  });

  it('does not request a bot for the OFF wire value', () => {
    const policyResult = buildMeetingBotPolicyResult(
      buildCalendarEventInput({
        meetingBotPreference: 'OFF',
      }),
      NOW,
    );

    expect(policyResult.meetingBotPreference).toBe('OFF');
    expect(policyResult.shouldRequestBot).toBe(false);
    expect(policyResult.reason).toBe('PREFERENCE_OFF');
  });
});
