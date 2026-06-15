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
  calendarChannelOwners: [],
  ...overrides,
});

describe('buildMeetingBotPolicyResult', () => {
  it('treats the AUTO wire value as no override and follows channel owner auto-record settings', () => {
    const policyResult = buildMeetingBotPolicyResult(
      buildCalendarEventInput({
        meetingBotPreference: 'AUTO',
        calendarChannelOwners: [
          {
            workspaceMemberId: 'workspace-member-1',
            workspaceMemberMeetingBotAutoRecordEnabled: true,
          },
        ],
      }),
      NOW,
    );

    expect(policyResult.meetingBotPreference).toBeUndefined();
    expect(policyResult.shouldRequestBot).toBe(true);
    expect(policyResult.reason).toBe('MEMBER_AUTO_RECORD');
  });

  it('does not request a bot for AUTO when no syncing member has auto-record enabled', () => {
    const policyResult = buildMeetingBotPolicyResult(
      buildCalendarEventInput({
        meetingBotPreference: 'AUTO',
        calendarChannelOwners: [
          {
            workspaceMemberId: 'workspace-member-1',
            workspaceMemberMeetingBotAutoRecordEnabled: false,
          },
        ],
      }),
      NOW,
    );

    expect(policyResult.meetingBotPreference).toBeUndefined();
    expect(policyResult.shouldRequestBot).toBe(false);
    expect(policyResult.reason).toBe('NO_MEMBER_AUTO_RECORD');
  });
});
